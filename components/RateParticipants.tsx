import { backend_URL } from "@/backendURL";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StarRating } from "./StarRating";

type Participant = {
  id: number;
  userName: string;
  avatar?: string | null;
  age?: number | null;
};

type RatingState = {
  stars: number;
  tags: string[];
};

const positiveTags = [
  "kontaktowny/a",
  "zabawny/a",
  "przyjacielski/a",
  "punktualny/a",
  "wygadany/a",
  "pomocny/a",
];

const negativeTags = [
  "mało kontaktowny/a",
  "mało zaangażowany/a",
  "spóźnialski/a",
  "konfliktowy/a",
  "niepunktualny/a",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  eventId: string | number;
  participants: any[];
  onSubmitted?: () => void;
  eventTitle?: string;
  excludeUserId?: number;

  // ✅ NOWE: czy event zakończony (blokujemy ocenianie do końca)
  isEventFinished?: boolean;
};

const RateParticipantsModal = ({
  visible,
  onClose,
  eventId,
  onSubmitted,
  participants,
  eventTitle = "",
  excludeUserId,
  isEventFinished = false,
}: Props) => {
  const { userId } = useAuth();

  const eventIdStr = useMemo(() => String(eventId ?? ""), [eventId]);
  const raterIdNum = useMemo(() => Number(userId), [userId]);

  // ✅ Helper: wyciągnij id z różnych struktur
  const extractId = (p: any): number | null => {
    const candidates = [
      p?.id,
      p?.userId,
      p?.participantId,
      p?.user?.id,
      p?.user?.userId,
    ];
    for (const c of candidates) {
      const n = Number(c);
      if (!Number.isNaN(n) && n > 0) return n;
    }
    return null;
  };

  // ✅ Helper: userName z różnych struktur
  const extractUserName = (p: any): string => {
    return (
      p?.userName ??
      p?.username ??
      p?.name ??
      p?.user?.userName ??
      p?.user?.username ??
      p?.user?.name ??
      "Użytkownik"
    );
  };

  // ✅ Helper: avatar z różnych struktur
  const extractAvatar = (p: any): string | null => {
    return (p?.avatar ??
      p?.avatarUrl ??
      p?.user?.avatar ??
      p?.user?.avatarUrl ??
      null) as string | null;
  };

  const extractAge = (p: any): number | null => {
    const a = p?.age ?? p?.user?.age;
    return typeof a === "number" ? a : null;
  };

  // ✅ Normalizacja danych z pokoju -> (id, userName, avatar, age)
  const normalizedParticipants: Participant[] = useMemo(() => {
    return (participants || [])
      .map((p: any) => {
        const id = extractId(p);
        if (!id) return null;
        return {
          id,
          userName: extractUserName(p),
          avatar: extractAvatar(p),
          age: extractAge(p),
        } as Participant;
      })
      .filter(Boolean) as Participant[];
  }, [participants]);

  // ✅ tylko ci, których oceniamy (bez siebie)
  const rateableParticipants = useMemo(() => {
    const me = Number(excludeUserId ?? userId);
    return normalizedParticipants.filter((p) => p.id !== me);
  }, [normalizedParticipants, excludeUserId, userId]);

  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState<Record<number, RatingState>>({});

  // ✅ blokada "tylko raz"
  const [alreadyRatedEvent, setAlreadyRatedEvent] = useState(false);
  const [checkingAlreadyRated, setCheckingAlreadyRated] = useState(false);

  const storageKey = useMemo(() => {
    const eventIdNum = Number(eventIdStr);
    if (!Number.isFinite(eventIdNum) || eventIdNum <= 0) return null;
    if (!Number.isFinite(raterIdNum) || raterIdNum <= 0) return null;
    return `rated_event_${eventIdNum}_by_${raterIdNum}`;
  }, [eventIdStr, raterIdNum]);

  // ✅ reset po zamknięciu
  useEffect(() => {
    if (!visible) {
      setSubmitting(false);
      setRatings({});
      setAlreadyRatedEvent(false);
      setCheckingAlreadyRated(false);
    }
  }, [visible]);

  // ✅ sprawdzamy lokalnie czy już ocenił event (UX)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!visible) return;
      if (!storageKey) return;

      try {
        setCheckingAlreadyRated(true);
        const v = await AsyncStorage.getItem(storageKey);
        if (!cancelled) {
          const isRated = v === "1";
          setAlreadyRatedEvent(isRated);
          console.log(
            "[ratings] alreadyRatedEvent from storage:",
            isRated,
            "key:",
            storageKey,
          );
        }
      } catch (e) {
        console.log("[ratings] storage read error:", e);
      } finally {
        if (!cancelled) setCheckingAlreadyRated(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [visible, storageKey]);

  // ✅ inicjalizacja ocen po otwarciu modala / zmianie listy
  useEffect(() => {
    if (!visible) return;

    setRatings((prev) => {
      const next: Record<number, RatingState> = {};
      rateableParticipants.forEach((p) => {
        next[p.id] = prev[p.id] ?? { stars: 0, tags: [] };
      });
      return next;
    });
  }, [visible, rateableParticipants]);

  const toggleTag = (userIdTarget: number, tag: string) => {
    setRatings((prev) => {
      const current = prev[userIdTarget] || { stars: 0, tags: [] };
      const tags = current.tags.includes(tag)
        ? current.tags.filter((t) => t !== tag)
        : [...current.tags, tag];
      return { ...prev, [userIdTarget]: { ...current, tags } };
    });
  };

  const handleStarChange = (userIdTarget: number, stars: number) => {
    setRatings((prev) => ({ ...prev, [userIdTarget]: { stars, tags: [] } }));
  };

  const handleSubmit = async () => {
    // ✅ blokada oceniania do końca wydarzenia (UX + bezpieczeństwo)
    if (!isEventFinished) {
      Alert.alert(
        "Za wcześnie",
        "Możesz ocenić uczestników dopiero po zakończeniu wydarzenia.",
      );
      return;
    }

    const eventIdNum = Number(eventIdStr);
    if (Number.isNaN(eventIdNum) || eventIdNum <= 0) {
      Alert.alert("Błąd", "Nieprawidłowe ID wydarzenia.");
      return;
    }

    if (Number.isNaN(raterIdNum) || raterIdNum <= 0) {
      Alert.alert(
        "Błąd",
        "Brak poprawnego userId (raterId). Zaloguj się ponownie.",
      );
      return;
    }

    if (alreadyRatedEvent) {
      Alert.alert(
        "Już oceniłeś",
        "Możesz wystawić ocenę tylko raz na całe wydarzenie.",
      );
      return;
    }

    const payloadRatings = rateableParticipants
      .map((p) => ({
        rateeId: p.id,
        stars: ratings[p.id]?.stars || 0,
        tags: ratings[p.id]?.tags || [],
      }))
      .filter((r) => r.stars > 0);

    if (payloadRatings.length === 0) {
      Alert.alert("Brak ocen", "Oceń przynajmniej jedną osobę.");
      return;
    }

    // ✅ UWAGA: usuwamy force=true (bo to obchodzi blokadę w backendzie)
    const url = `${backend_URL}/api/events/${eventIdNum}/ratings`;

    try {
      setSubmitting(true);

      const body = { raterId: raterIdNum, ratings: payloadRatings };

      console.log("📤 [ratings] URL:", url);
      console.log("📤 [ratings] BODY:", JSON.stringify(body, null, 2));

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        // ✅ sukces -> oznacz lokalnie że już ocenił event
        if (storageKey) await AsyncStorage.setItem(storageKey, "1");
        setAlreadyRatedEvent(true);

        // ✅ callback (u Ciebie robi router.replace na Event.tsx)
        onSubmitted?.();

        return;
      }

      const text = await res.text();
      console.log("📥 [ratings] STATUS:", res.status);
      console.log("📥 [ratings] RESPONSE:", text);

      // ✅ jeśli backend zablokował “raz na event”
      if (res.status === 409) {
        let err = "ALREADY_RATED_EVENT";
        try {
          const j = JSON.parse(text);
          err = j?.error ?? err;
        } catch {}

        if (err === "ALREADY_RATED_EVENT") {
          setAlreadyRatedEvent(true);
          if (storageKey) await AsyncStorage.setItem(storageKey, "1");
          Alert.alert(
            "Już oceniłeś",
            "Możesz wystawić ocenę tylko raz na całe wydarzenie.",
          );
          return;
        }
      }

      if (!res.ok) {
        let errMsg = "Nie udało się zapisać ocen.";
        try {
          const asJson = JSON.parse(text);
          errMsg = asJson?.error || errMsg;
        } catch {}
        Alert.alert("Błąd", `${errMsg} (HTTP ${res.status})`);
        return;
      }

      // ✅ sukces -> oznacz lokalnie że już ocenił event
      if (storageKey) await AsyncStorage.setItem(storageKey, "1");
      setAlreadyRatedEvent(true);

      Alert.alert("Dziękujemy!", "Twoje oceny zostały zapisane.");
      onClose();
    } catch (err) {
      console.log("❌ [ratings] submit error:", err);
      Alert.alert("Błąd", "Wystąpił problem podczas zapisywania ocen.");
    } finally {
      setSubmitting(false);
    }
  };

  const shouldShowLoading =
    visible &&
    (participants == null ||
      (Array.isArray(participants) && participants.length === 0));

  const submitDisabled =
    submitting || alreadyRatedEvent || checkingAlreadyRated || !isEventFinished; // ✅ NOWE

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {
        if (!submitting) onClose();
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.65)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#0d1a4d",
            borderRadius: 16,
            padding: 16,
            maxHeight: "90%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
                Oceń uczestników
              </Text>

              {!!eventTitle && (
                <Text style={{ color: "#cfe8ff", fontSize: 13, marginTop: 2 }}>
                  {eventTitle}
                </Text>
              )}
            </View>
          </View>

          {/* ✅ banner jeśli już ocenił */}
          {checkingAlreadyRated ? (
            <Text style={{ color: "#cfe8ff", marginBottom: 10 }}>
              Sprawdzam, czy już oceniłeś…
            </Text>
          ) : alreadyRatedEvent ? (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.10)",
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#cfe8ff", fontWeight: "700" }}>
                Już oceniłeś to wydarzenie.
              </Text>
              <Text style={{ color: "#cfe8ff", marginTop: 4, opacity: 0.9 }}>
                Możesz wystawić ocenę tylko raz na całe wydarzenie.
              </Text>
            </View>
          ) : null}

          {/* ✅ NOWE: banner gdy event jeszcze trwa */}
          {!alreadyRatedEvent && !checkingAlreadyRated && !isEventFinished ? (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.10)",
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              <Text style={{ color: "#cfe8ff", fontWeight: "800" }}>
                Ocenianie będzie dostępne po zakończeniu wydarzenia.
              </Text>
              <Text style={{ color: "#cfe8ff", marginTop: 4, opacity: 0.9 }}>
                Wystawisz oceny dopiero, gdy wydarzenie się zakończy.
              </Text>
            </View>
          ) : null}

          {/* Body */}
          {shouldShowLoading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={{ color: "#cfe8ff", marginTop: 12 }}>
                Ładowanie uczestników…
              </Text>
            </View>
          ) : rateableParticipants.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <Text style={{ color: "#cfe8ff", textAlign: "center" }}>
                Brak osób do oceny.
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={rateableParticipants}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 90 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const currentRating = ratings[item.id] || {
                    stars: 0,
                    tags: [],
                  };

                  const tagsToShow =
                    currentRating.stars === 5
                      ? positiveTags
                      : currentRating.stars > 0
                        ? negativeTags
                        : [];

                  return (
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: 12,
                        marginBottom: 12,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        opacity:
                          alreadyRatedEvent || !isEventFinished ? 0.6 : 1,
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#1c2b5a",
                          overflow: "hidden",
                          marginRight: 12,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {item.avatar ? (
                          <Image
                            source={{ uri: item.avatar }}
                            style={{ width: 50, height: 50 }}
                          />
                        ) : (
                          <Text style={{ color: "#fff", fontSize: 18 }}>
                            {item.userName?.charAt(0)?.toUpperCase() || "?"}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 16,
                            fontWeight: "600",
                            marginBottom: 6,
                          }}
                        >
                          {item.userName}
                        </Text>

                        <StarRating
                          value={currentRating.stars}
                          onChange={(v: number) => {
                            if (alreadyRatedEvent || !isEventFinished) return;
                            handleStarChange(item.id, v);
                          }}
                        />

                        {tagsToShow.length > 0 && (
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              marginTop: 8,
                            }}
                          >
                            {tagsToShow.map((tag) => {
                              const selected = currentRating.tags.includes(tag);

                              return (
                                <TouchableOpacity
                                  key={tag}
                                  onPress={() => {
                                    if (alreadyRatedEvent || !isEventFinished)
                                      return;
                                    toggleTag(item.id, tag);
                                  }}
                                  style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: selected ? "#1E3A8A" : "#445",
                                    backgroundColor: selected
                                      ? "rgba(0,169,244,0.2)"
                                      : "transparent",
                                    marginRight: 6,
                                    marginBottom: 6,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: selected ? "#EAF6FF" : "#cfe8ff",
                                      fontSize: 12,
                                    }}
                                  >
                                    {tag}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                }}
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitDisabled}
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                  backgroundColor: submitDisabled ? "#007bb8" : "#1E3A8A",
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: submitDisabled ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator />
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: 16,
                        marginLeft: 10,
                      }}
                    >
                      Zapisywanie…
                    </Text>
                  </View>
                ) : !isEventFinished ? (
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                  >
                    Dostępne po zakończeniu
                  </Text>
                ) : alreadyRatedEvent ? (
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                  >
                    Już ocenione
                  </Text>
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                  >
                    Zapisz oceny
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default RateParticipantsModal;
