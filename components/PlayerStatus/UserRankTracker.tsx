import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Image,
  ImageSourcePropType,
  Platform,
  Text,
  View,
} from "react-native";

// ====== Typy rangi ======
export type RankId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface RankContext {
  completedEvents: number;
  uniqueLocations?: number;
}

export interface RankDefinition {
  id: RankId;
  title: string;
  min?: number;
  max?: number;
  requires?: (ctx: RankContext) => boolean;
  description?: string;
  icon?: { type: "image"; source: ImageSourcePropType };
}

// ====== Progi i rangi ======
const LOCATION_THRESHOLD_FOR_EXPLORER = 5;

// 🔁 Podstaw pod własne nazwy/ścieżki plików w assets:
const RANK_IMAGES = {
  nowy: require("../../assets/images/nowyWmiescie.png"),
  odkrywca: require("../../assets/images/odkrywcaDzielnic.png"),
  bywalec: require("../../assets/images/bywalecSpotkan.png"),
  miejski: require("../../assets/images/miejskiWyjadacz.png"),
  tworca: require("../../assets/images/tworca-klimatu.png"),
  lider: require("../../assets/images/liderOsiedla.png"),
  dusza: require("../../assets/images/duszaTowarzystwa.png"),
  ambasador: require("../../assets/images/ambasadormeeton.png"),
  legenda: require("../../assets/images/legendaMiasta.png"),
};

const RANKS: RankDefinition[] = [
  { id: 0, title: "Nowy na mieście", min: 0, max: 20, description: "Pierwsze kroki w społeczności.", icon: { type: "image", source: RANK_IMAGES.nowy } },
  { id: 1, title: "Odkrywca dzielnic", min: 0, max: 20, requires: (ctx) => (ctx.uniqueLocations ?? 0) >= LOCATION_THRESHOLD_FOR_EXPLORER && ctx.completedEvents >= 10, description: "Był na kilku wydarzeniach w różnych miejscach.", icon: { type: "image", source: RANK_IMAGES.odkrywca } },
  { id: 2, title: "Bywalec spotkań", min: 21, max: 40, description: "Regularnie uczestniczy w wydarzeniach.", icon: { type: "image", source: RANK_IMAGES.bywalec } },
  { id: 3, title: "Miejski wyjadacz", min: 41, max: 70, description: "Miasto zna jak własną kieszeń.", icon: { type: "image", source: RANK_IMAGES.miejski } },
  { id: 4, title: "Twórca klimatu", min: 71, max: 120, description: "Często organizuje, przyciąga ludzi.", icon: { type: "image", source: RANK_IMAGES.tworca } },
  { id: 5, title: "Lider osiedla", min: 121, max: 200, description: "Bardzo aktywny lokalnie.", icon: { type: "image", source: RANK_IMAGES.lider } },
  { id: 6, title: "Dusza towarzystwa", min: 201, max: 300, description: "Zawsze obecny, robi klimat.", icon: { type: "image", source: RANK_IMAGES.dusza } },
  { id: 8, title: "Ambasador meetOn", min: 301, max: 500, description: "Wspiera nowych i promuje aplikację.", icon: { type: "image", source: RANK_IMAGES.ambasador } },
  { id: 7, title: "Legenda miasta", min: 501, description: "Ikona społeczności.", icon: { type: "image", source: RANK_IMAGES.legenda } },
];

// ====== Utils ======
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function evaluateRank(ctx: RankContext) {
  const { completedEvents } = ctx;

  // Ustal bazową rangę wg widełek (pomijamy #1 – „Odkrywca” to warunek specjalny)
  let base =
    RANKS.filter((r) => {
      const min = r.min ?? 0;
      const max = r.max ?? Number.POSITIVE_INFINITY;
      return completedEvents >= min && completedEvents <= max && r.id !== 1;
    }).sort((a, b) => (a.min ?? 0) - (b.min ?? 0))[0] ?? RANKS[0];

  // Jeśli w widełkach 0–20 spełnione wymagania „Odkrywcy”, przypisz #1
  const explorer = RANKS.find((r) => r.id === 1)!;
  const inFirstBracket = completedEvents <= (base.max ?? 20);
  if (base.id === 0 && inFirstBracket && explorer.requires?.(ctx)) {
    base = explorer;
  }

  const min = base.min ?? 0;
  const max = base.max ?? Number.POSITIVE_INFINITY;

  const next = RANKS.find(
    (r) => (r.min ?? 0) === (isFinite(max) ? max + 1 : Number.POSITIVE_INFINITY)
  );
  let progress = 1;
  const current = clamp(completedEvents - min, 0, Math.max(max - min, 1));
  const total = Math.max(max - min, 1);

  if (isFinite(max)) {
    progress = clamp(current / total, 0, 1);
  } else {
    progress = 1; // Legenda – brak górnej granicy
  }

  return {
    rank: base,
    nextRank: next,
    progress,
    currentValue: completedEvents,
    currentMin: min,
    currentMax: max,
  };
}

async function postCompletionOnce(params: {
  apiBaseUrl: string;
  userId: number | string;
  eventId?: number | string;
  abortSignal?: AbortSignal;
}) {
  const url = `${params.apiBaseUrl}/api/users/${params.userId}/rank/complete`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: params.abortSignal,
    body: JSON.stringify({ eventId: params.eventId ?? null }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`POST ${url} failed: ${res.status} ${errText}`);
  }
}

// ====== Props i komponent ======
export interface UserRankTrackerProps {
  userId: number | string;
  initialCompletedEvents: number;
  initialUniqueLocations?: number;
  eventEndDate?: string | Date;
  eventId?: number | string;
  apiBaseUrl?: string;
  compact?: boolean;
  style?: object;
  onRankChange?: (rankId: RankId) => void;
  onCompletedIncrement?: (newCompleted: number) => void;
}

export const UserRankTracker: React.FC<UserRankTrackerProps> = ({
  userId,
  initialCompletedEvents,
  initialUniqueLocations = 0,
  eventEndDate,
  eventId,
  apiBaseUrl = "https://meeton-backend-ffmo.onrender.com",
  compact = false,
  style,
  onRankChange,
  onCompletedIncrement,
}) => {
  const [completed, setCompleted] = useState<number>(initialCompletedEvents);
  const [uniqueLocations] = useState<number>(initialUniqueLocations);
  const [isAwardedForThisEvent, setIsAwardedForThisEvent] = useState(false);

  const awardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const rankInfo = useMemo(
    () => evaluateRank({ completedEvents: completed, uniqueLocations }),
    [completed, uniqueLocations]
  );

  useEffect(() => {
    onRankChange?.(rankInfo.rank.id);
  }, [rankInfo.rank.id]);

  // Naliczenie ukończenia po końcu wydarzenia
  useEffect(() => {
    if (!eventEndDate || isAwardedForThisEvent) return;

    const end = typeof eventEndDate === "string" ? new Date(eventEndDate) : eventEndDate;

    const tryAward = async () => {
      if (isAwardedForThisEvent) return;
      try {
        await postCompletionOnce({ apiBaseUrl, userId, eventId });
        setIsAwardedForThisEvent(true);
        setCompleted((prev) => {
          const nextVal = prev + 1;
          onCompletedIncrement?.(nextVal);
          return nextVal;
        });
      } catch (e) {
        console.warn("[UserRankTracker] awarding failed:", (e as Error).message);
      }
    };

    const schedule = () => {
      const ms = end.getTime() - Date.now();
      if (ms <= 0) {
        void tryAward();
      } else {
        awardTimerRef.current = setTimeout(() => void tryAward(), ms);
      }
    };

    schedule();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
        if (Date.now() >= end.getTime()) void tryAward();
      }
      appStateRef.current = nextState;
    };

    const sub = AppState.addEventListener("change", onAppStateChange);

    return () => {
      sub.remove();
      if (awardTimerRef.current) clearTimeout(awardTimerRef.current);
    };
  }, [eventEndDate, isAwardedForThisEvent, apiBaseUrl, eventId, userId]);

  // 🔺 powiększony x2 obrazek i +50% spacing
  const RankIcon = () => {
    const icon = rankInfo.rank.icon;
    if (!icon) return null;
    return (
      <Image
        source={icon.source}
        style={{
          width: 80,          // było 22
          height: 60,         // było 22
          marginRight: 9,     // było 6
          borderRadius: 8,    // było 4
          resizeMode: "cover",
        }}
      />
    );
  };

  // 🔺 grubszy pasek postępu (+50%)
  const ProgressBar = ({ progress }: { progress: number }) => (
    <View
      style={{
        height: 12,            // było 8
        width: "100%",
        backgroundColor: "#E6F6FE",
        borderRadius: 999,
        overflow: "hidden",
        marginTop: 12,         // było 8
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${Math.round(progress * 100)}%`,
          backgroundColor: "#00A9F4",
        }}
      />
    </View>
  );

  return (
    <View
      style={[
        {
          borderRadius: 24,             // było 16
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#E8E8E8",
          padding: 18,                  // było 12
          shadowColor: "#000",
          shadowOpacity: Platform.OS === "ios" ? 0.06 : 0.12,
          shadowRadius: 9,              // było 6
          elevation: 3,                 // było 2
          marginHorizontal: 18,         // było 12
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 /* było 4 */ }}>
        <RankIcon />
        <Text style={{ fontWeight: "900", fontSize: 21 /* było 14 */, color: "#111" }}>
          {rankInfo.rank.title}
        </Text>
      </View>

      {!compact && (
        <>
          <Text style={{ color: "#444", fontSize: 18 /* było 12 */ }}>
            Ukończone wydarzenia:{" "}
            <Text style={{ fontWeight: "700" }}>{rankInfo.currentValue}</Text>
          </Text>

          <ProgressBar progress={rankInfo.progress} />

          {!!rankInfo.rank.description && (
            <Text style={{ color: "#777", fontSize: 17 /* było 11 */, marginTop: 9 /* było 6 */ }}>
              {rankInfo.rank.description}
            </Text>
          )}
        </>
      )}
    </View>
  );
};
