import ChatBox, { Message } from "@/components/ChatBox";
import ParticipantDetailsModal from "@/components/ParticipantDetailsModal";
import RateParticipantsModal from "@/components/RateParticipants";
import { useEndEventListener } from "@/hooks/useEndEventListener";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppState,
  BackHandler,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/EventScreenRoom.styles";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const socket = io("https://meeton-backend-ffmo.onrender.com", {
  transports: ["websocket"],
});

/** ✅ helper: czy event zakończony po endDate */
function isEventFinishedByDates(event: any): boolean {
  const end = event?.endDate ? new Date(event.endDate).getTime() : NaN;
  if (!Number.isFinite(end)) return false;
  return Date.now() >= end;
}

type TagCount = { tag: string; count: number };

type RatingsUserRow = {
  userId: number;
  stars?: { average?: number; count?: number; distribution?: any };
  tags?: Array<TagCount | string>;
};

type RatingsEntry = {
  avg: number;
  count: number;
  tags: TagCount[];
};

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** ✅ WYMUSZA HTTPS (kluczowe przy http:// z backendu) */
function forceHttps(url?: string | null): string | null {
  if (!url) return null;
  if (typeof url !== "string") return null;
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

/**
 * ✅ KLUCZOWE: wyciąga PRAWDZIWE User.id z obiektu participant
 */
function resolveUserIdFromParticipant(p: any): number | null {
  const candidates = [
    p?.userId,
    p?.user?.id,
    p?.user?.userId,
    p?.profile?.id,
    p?.profile?.userId,
    p?.participant?.userId,
    p?.participant?.id,
    p?.participant?.user?.id,
    p?.participant?.user?.userId,
    p?.id, // na końcu dopiero
  ];

  for (const c of candidates) {
    const n = toNum(c);
    if (n) return n;
  }
  return null;
}

function resolveUserNameFromParticipant(p: any): string {
  return (
    p?.userName ??
    p?.username ??
    p?.name ??
    p?.login ??
    p?.user?.userName ??
    p?.user?.username ??
    p?.user?.name ??
    "Użytkownik"
  );
}

function resolveAvatarFromParticipant(p: any): string | null {
  const raw =
    (p?.avatar ??
      p?.avatarUrl ??
      p?.photo ??
      p?.photoUrl ??
      p?.user?.avatar ??
      p?.user?.avatarUrl ??
      null) as string | null;

  return forceHttps(raw);
}

function resolveAgeFromParticipant(p: any): number | null {
  const a = p?.age ?? p?.user?.age;
  return typeof a === "number" ? a : null;
}

function resolveDescriptionFromParticipant(p: any): string | null {
  const d =
    p?.description ??
    p?.bio ??
    p?.about ??
    p?.user?.description ??
    p?.user?.bio ??
    null;
  return typeof d === "string" ? d : null;
}

/** ⭐ Badge z oceną obok imienia */
const RatingBadge = ({ avg, count }: { avg?: number; count?: number }) => {
  if (avg == null || Number.isNaN(avg)) return null;

  return (
    <View
      style={{
        marginLeft: 8,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EAF6FF",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
      }}
    >
      <Ionicons name="star" size={14} color="#1E3A8A" />
      <Text
        style={{
          marginLeft: 4,
          fontWeight: "700",
          color: "#1B4D6B",
          fontSize: 12,
        }}
      >
        {avg.toFixed(1)}
      </Text>

      {typeof count === "number" && count > 0 && (
        <Text style={{ marginLeft: 4, color: "#1B4D6B", fontSize: 11 }}>
          ({count})
        </Text>
      )}
    </View>
  );
};

const MeBadge = () => (
  <View
    style={{
      marginLeft: 8,
      backgroundColor: "rgba(30,58,138,0.12)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(30,58,138,0.25)",
    }}
  >
    <Text style={{ marginLeft: 6 }}>👈🏻</Text>
  </View>
);

const LocalEventRoom = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams();
  const { userId, userName } = useAuth();

  // ✅ stabilny number id użytkownika (żeby (Ty) zawsze działało)
  const myId = useMemo(() => {
    const n = Number(userId);
    return Number.isFinite(n) ? n : null;
  }, [userId]);

  const currentEventId = useMemo(() => {
    const raw = (params as any)?.eventId;
    return typeof raw === "string"
      ? raw
      : Array.isArray(raw)
      ? raw[0]
      : undefined;
  }, [params]);

  const [participants, setParticipants] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // ✅ Modal profilu
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(
    null
  );
  const [selectedRating, setSelectedRating] = useState<{
    avg: number;
    count: number;
  } | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagCount[]>([]);

  const [isExpanded, setIsExpanded] = useState(false);

  const { showRatingModal, setShowRatingModal } = useEndEventListener({
    socket,
    currentEventId,
  });

  // ✅ czy wydarzenie zakończone (na podstawie endDate)
  const isEventFinished = useMemo(() => {
    return isEventFinishedByDates(currentEvent);
  }, [currentEvent]);

  // =========================
  // ✅ GATE NA OCENĘ PO END
  // =========================
  const [ratingRequired, setRatingRequired] = useState(false);
  const [ratingCompleted, setRatingCompleted] = useState(false);

  const autoOpenRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoOpen = useCallback(() => {
    if (autoOpenRef.current) {
      clearTimeout(autoOpenRef.current);
      autoOpenRef.current = null;
    }
  }, []);

  // 🔒 kiedy event się kończy -> wymagamy oceny i auto-otwieramy modal, jeśli user nie kliknie
  useEffect(() => {
    if (!isEventFinished) {
      setRatingRequired(false);
      clearAutoOpen();
      return;
    }

    if (ratingCompleted) {
      setRatingRequired(false);
      clearAutoOpen();
      return;
    }

    setRatingRequired(true);

    if (showRatingModal) {
      clearAutoOpen();
      return;
    }

    clearAutoOpen();
    autoOpenRef.current = setTimeout(() => {
      setShowRatingModal(true);
    }, 2000);

    return () => clearAutoOpen();
  }, [
    isEventFinished,
    ratingCompleted,
    showRatingModal,
    setShowRatingModal,
    clearAutoOpen,
  ]);

  // 🔒 gdy app wraca z tła po endDate
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        const finishedNow = isEventFinishedByDates(currentEvent);
        if (finishedNow && !ratingCompleted) {
          setRatingRequired(true);
          if (!showRatingModal) setShowRatingModal(true);
        }
      }
    });

    return () => sub.remove();
  }, [currentEvent, ratingCompleted, showRatingModal, setShowRatingModal]);

  // 🔒 blokada Android BACK, dopóki ratingRequired
  useEffect(() => {
    if (!ratingRequired) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert(
        "Dokończ ocenę",
        "Aby wyjść z pokoju, musisz ocenić uczestników."
      );
      return true;
    });

    return () => sub.remove();
  }, [ratingRequired]);

  // 🔒 blokada iOS swipe-back / header-back / router back
  useFocusEffect(
    useCallback(() => {
      if (!ratingRequired) return;

      const unsub = navigation.addListener("beforeRemove", (e: any) => {
        e.preventDefault();
        Alert.alert(
          "Dokończ ocenę",
          "Aby wyjść z pokoju, musisz ocenić uczestników."
        );
      });

      return unsub;
    }, [navigation, ratingRequired])
  );

  // ✅ MAPA OCEN Z EVENTU
  const [eventRatingsMap, setEventRatingsMap] = useState<
    Record<number, RatingsEntry>
  >({});

  // ✅ pełny profil twórcy
  const [creatorProfile, setCreatorProfile] = useState<any | null>(null);

  const fetchEventDetails = useCallback(async () => {
    if (!currentEventId) return;

    try {
      const res = await fetch(
        `https://meeton-backend-ffmo.onrender.com/api/event/${currentEventId}/details`
      );
      const data = await res.json();
      setCurrentEvent(data);
      setParticipants(data.participants || []);
    } catch (err) {
      console.error("Błąd pobierania szczegółów wydarzenia:", err);
    }
  }, [currentEventId]);

  const fetchEventRatings = useCallback(async () => {
    if (!currentEventId) return;

    const url = `https://meeton-backend-ffmo.onrender.com/api/events/${currentEventId}/ratings`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const users: RatingsUserRow[] = Array.isArray(data?.users)
        ? data.users
        : [];

      const nextMap: Record<number, RatingsEntry> = {};

      for (const u of users) {
        const uid = toNum(u?.userId);
        if (!uid) continue;

        const avg = Number(u?.stars?.average ?? 0);
        const count = Number(u?.stars?.count ?? 0);

        const tagsArr = Array.isArray(u?.tags) ? u.tags : [];
        const normalizedTags: TagCount[] = tagsArr
          .map((t: any) => {
            if (typeof t === "string") {
              const clean = t.trim();
              return clean ? { tag: clean, count: 1 } : null;
            }

            const tag = String(t?.tag ?? t?.name ?? t?.label ?? "").trim();
            const c = Number(t?.count ?? t?.votes ?? t?.total ?? 1);
            if (!tag) return null;
            return { tag, count: Number.isFinite(c) ? c : 1 };
          })
          .filter(Boolean) as TagCount[];

        normalizedTags.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

        nextMap[uid] = {
          avg: Number.isFinite(avg) ? avg : 0,
          count: Number.isFinite(count) ? count : 0,
          tags: normalizedTags,
        };
      }

      setEventRatingsMap(nextMap);
    } catch (e) {
      console.log("[event ratings] FAIL:", e);
      setEventRatingsMap({});
    }
  }, [currentEventId]);

  useEffect(() => {
    fetchEventDetails();
    fetchEventRatings();
  }, [fetchEventDetails, fetchEventRatings]);

  useEffect(() => {
    if (showRatingModal) {
      fetchEventDetails();
      fetchEventRatings();
      clearAutoOpen();
    }
  }, [showRatingModal, fetchEventDetails, fetchEventRatings, clearAutoOpen]);

  useEffect(() => {
    if (!currentEventId) return;

    socket.emit("joinRoom", currentEventId);

    const onMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("message", onMessage);
    socket.on("participantJoined", fetchEventDetails);
    socket.on("participantLeft", fetchEventDetails);

    return () => {
      socket.emit("leaveRoom", currentEventId);
      socket.off("message", onMessage);
      socket.off("participantJoined", fetchEventDetails);
      socket.off("participantLeft", fetchEventDetails);
    };
  }, [currentEventId, fetchEventDetails]);

  const handleSendMessage = (content: string) => {
    if (!currentEventId || !userName) return;

    socket.emit("sendMessage", {
      eventId: currentEventId,
      content,
      sender: userName,
    });
  };

  const getUserEntry = useCallback(
    (uid?: number | null) => {
      if (!uid) return null;
      return eventRatingsMap[uid] ?? null;
    },
    [eventRatingsMap]
  );

  // ✅ Creator info z eventu (User.id)
  const creatorId = useMemo(() => {
    const cands = [
      currentEvent?.creatorId,
      currentEvent?.creator?.id,
      currentEvent?.creator?.userId,
      currentEvent?.ownerId,
      currentEvent?.hostId,
      currentEvent?.createdById,
    ];
    for (const c of cands) {
      const n = toNum(c);
      if (n) return n;
    }
    return null;
  }, [currentEvent]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!creatorId) {
        setCreatorProfile(null);
        return;
      }

      try {
        const res = await fetch(
          `https://meeton-backend-ffmo.onrender.com/api/user/profile/${creatorId}`
        );
        const profile = await res.json();

        if (cancelled) return;
        if (profile?.error) {
          setCreatorProfile(null);
          return;
        }

        setCreatorProfile(profile);
      } catch {
        if (!cancelled) setCreatorProfile(null);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [creatorId]);

  const creatorName =
    creatorProfile?.userName ??
    creatorProfile?.username ??
    currentEvent?.creator?.userName ??
    currentEvent?.creator?.username ??
    currentEvent?.creatorName ??
    "Twórca";

  const creatorAvatar =
    creatorProfile?.avatar ??
    creatorProfile?.avatarUrl ??
    currentEvent?.creator?.avatar ??
    currentEvent?.creator?.avatarUrl ??
    null;

  // ✅ ważne: wymuś https na twórcy
  const creatorAvatarSafe = forceHttps(creatorAvatar);

  const buildFallbackProfileFromItem = useCallback((item: any) => {
    const id = resolveUserIdFromParticipant(item);
    const name = resolveUserNameFromParticipant(item);
    const avatar = resolveAvatarFromParticipant(item);
    const age = resolveAgeFromParticipant(item);
    const desc = resolveDescriptionFromParticipant(item) ?? "";

    return {
      id,
      userId: id,
      userName: name,
      username: name,
      avatar: avatar,
      avatarUrl: avatar,
      age,
      description: desc,
    };
  }, []);

  const openUserDetailsModal = useCallback(
    async (targetUserId: number, fallback?: any) => {
      try {
        const url = `https://meeton-backend-ffmo.onrender.com/api/user/profile/${targetUserId}`;
        const profileRes = await fetch(url);
        const rawText = await profileRes.text();

        let profile: any = null;
        try {
          profile = JSON.parse(rawText);
        } catch {}

        const profileIsEmpty =
          !profile ||
          (typeof profile === "object" && Object.keys(profile).length === 0);
        const profileHasError = !!profile?.error;

        const finalProfile =
          profileHasError || profileIsEmpty ? fallback : profile;

        if (!finalProfile) return;

        // ✅ dociśnij https na avatarze profilu, jeśli przyjdzie http
        if (finalProfile?.avatarUrl)
          finalProfile.avatarUrl = forceHttps(finalProfile.avatarUrl);
        if (finalProfile?.avatar) finalProfile.avatar = forceHttps(finalProfile.avatar);

        const keyId =
          toNum(finalProfile?.id) ??
          toNum(finalProfile?.userId) ??
          toNum(targetUserId);

        const entry = keyId ? eventRatingsMap[keyId] : undefined;

        setSelectedParticipant(finalProfile);
        setSelectedRating(entry ? { avg: entry.avg, count: entry.count } : null);
        setSelectedTags(entry?.tags ?? []);
        setDetailsModalVisible(true);
      } catch {
        if (fallback) {
          const keyId =
            toNum(fallback?.id) ??
            toNum(fallback?.userId) ??
            toNum(targetUserId);

          const entry = keyId ? eventRatingsMap[keyId] : undefined;

          // ✅ dociśnij https też na fallback
          if (fallback?.avatarUrl) fallback.avatarUrl = forceHttps(fallback.avatarUrl);
          if (fallback?.avatar) fallback.avatar = forceHttps(fallback.avatar);

          setSelectedParticipant(fallback);
          setSelectedRating(entry ? { avg: entry.avg, count: entry.count } : null);
          setSelectedTags(entry?.tags ?? []);
          setDetailsModalVisible(true);
        }
      }
    },
    [eventRatingsMap]
  );

  const handleLeave = async () => {
    // ✅ blokada wyjścia dopóki nie oceni
    if (ratingRequired) {
      Alert.alert(
        "Dokończ ocenę",
        "Aby wyjść z pokoju, musisz ocenić uczestników."
      );
      return;
    }

    const numericEventId = Number(currentEventId);
    if (!myId || !currentEventId || Number.isNaN(numericEventId)) return;

    try {
      const res = await fetch(
        "https://meeton-backend-ffmo.onrender.com/api/leave",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: myId, eventId: numericEventId }),
        }
      );

      if (res.ok) {
        socket.emit("participantLeft", currentEventId);
        router.replace("/(auth)/Event");
      } else {
        const data = await res.json();
        Alert.alert("Błąd", data.error || "Błąd opuszczania wydarzenia");
      }
    } catch (err) {
      console.error("Błąd opuszczania:", err);
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
    }
  };

  const handleSwitch = () => {
    // ✅ blokada przejścia dopóki nie oceni
    if (ratingRequired) {
      Alert.alert(
        "Dokończ ocenę",
        "Aby wyjść z pokoju, musisz ocenić uczestników."
      );
      return;
    }
    router.replace("./MyEvents");
  };

  const participantsForRating = useMemo(() => {
    const list: any[] = [];

    (participants || []).forEach((p: any) => {
      const uid = resolveUserIdFromParticipant(p);
      if (!uid) return;

      list.push({
        id: uid,
        userName: resolveUserNameFromParticipant(p),
        avatar: resolveAvatarFromParticipant(p),
        age: resolveAgeFromParticipant(p),
      });
    });

    if (creatorId && creatorName) {
      list.push({
        id: creatorId,
        userName: creatorName,
        avatar: creatorAvatarSafe,
      });
    }

    const map = new Map<number, any>();
    for (const p of list) map.set(p.id, p);
    return Array.from(map.values());
  }, [participants, creatorId, creatorName, creatorAvatarSafe]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <Stack.Screen
          options={{
            title: "WYDARZENIA",
            headerStyle: { backgroundColor: "#1E3A8A" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            headerLeft: () => null,
            // ✅ blokada gestu cofania na iOS dopóki ocena nie zakończona
            gestureEnabled: !ratingRequired,
          }}
        />

        <View style={[styles.container, { flex: 1 }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={[styles.eventInfo, { flex: 1 }]}>
              {creatorId ? (
                <TouchableOpacity
                  onPress={() => {
                    const fallback = creatorProfile ?? {
                      id: creatorId,
                      userId: creatorId,
                      userName: creatorName,
                      avatar: creatorAvatarSafe,
                      avatarUrl: creatorAvatarSafe,
                      description: creatorProfile?.description ?? null,
                    };
                    openUserDetailsModal(creatorId, fallback);
                  }}
                  activeOpacity={0.85}
                  style={{
                    alignSelf: "flex-start",
                    marginBottom: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 14,
                    backgroundColor: "#F3FAFF",
                    flexDirection: "row",
                    alignItems: "center",
                    maxWidth: "100%",
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: "#EAF6FF",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {creatorAvatarSafe ? (
                      <Image
                        source={{ uri: creatorAvatarSafe }}
                        style={{ width: 38, height: 38 }}
                      />
                    ) : (
                      <Text
                        style={{
                          fontWeight: "900",
                          color: "#1E3A8A",
                          fontSize: 16,
                        }}
                      >
                        {creatorName?.charAt(0)?.toUpperCase?.() ?? "?"}
                      </Text>
                    )}
                  </View>

                  <View style={{ marginLeft: 8, flexShrink: 1 }}>
                    <Text
                      style={{ fontWeight: "800", color: "#1B4D6B" }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {creatorName}
                      {myId != null && creatorId != null && myId === creatorId ? (
                        <Text style={{ color: "#1E3A8A", fontWeight: "900" }}>
                          {" "}
                          (Ty)
                        </Text>
                      ) : null}
                    </Text>

                    {(() => {
                      const e = getUserEntry(creatorId);
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 2,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: "#1B4D6B" }}>
                            Twórca
                          </Text>
                          <RatingBadge avg={e?.avg} count={e?.count} />
                        </View>
                      );
                    })()}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#1B4D6B"
                    style={{ marginLeft: 8, opacity: 0.7 }}
                  />
                </TouchableOpacity>
              ) : null}

              <Text style={styles.title}>
                {currentEvent?.location || "Brak lokalizacji"}
              </Text>

              <Text>
                {currentEvent?.startDate
                  ? new Date(currentEvent.startDate).toLocaleDateString()
                  : ""}{" "}
                {" • "}
                {currentEvent?.startDate
                  ? new Date(currentEvent.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}{" "}
                {" - "}
                {currentEvent?.endDate
                  ? new Date(currentEvent.endDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </Text>
            </View>

            {/* Buttony */}
            <View
              style={[
                styles.buttonContainer,
                { flexDirection: "column", gap: 10, alignItems: "flex-end" },
              ]}
            >
              <TouchableOpacity
                style={styles.leaveButtonWrapper}
                onPress={handleLeave}
              >
                <View style={styles.leaveTextWrapper}>
                  <Text style={styles.leaveButton}>Opuść</Text>
                  <Text style={styles.leaveButton}>wydarzenie</Text>
                </View>
                <Ionicons
                  name="exit-outline"
                  size={18}
                  color="#999"
                  style={styles.leaveIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.leaveButtonWrapper}
                onPress={handleSwitch}
              >
                <View style={styles.leaveTextWrapper}>
                  <Text style={styles.leaveButton}>Moje</Text>
                  <Text style={styles.leaveButton}>wydarzenia</Text>
                </View>
                <Ionicons
                  name="swap-vertical-outline"
                  size={18}
                  color="#999"
                  style={styles.leaveIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista uczestników */}
          <View style={styles.participantsContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.participantsTitle}>
                  {isExpanded ? "Ukryj uczestników ▲" : "Pokaż uczestników ▼"}
                </Text>
              </TouchableOpacity>

              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity
                  onPress={() => {
                    if (!currentEventId) return;

                    if (!isEventFinished) {
                      Alert.alert(
                        "Ocenianie zablokowane",
                        "Możesz ocenić uczestników dopiero po zakończeniu wydarzenia."
                      );
                      return;
                    }

                    setShowRatingModal(true);
                  }}
                  disabled={!currentEventId}
                  style={{
                    backgroundColor: isEventFinished
                      ? "#517fc5ff"
                      : "rgba(81,127,197,0.35)",
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    opacity: currentEventId ? 1 : 0.5,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                    Oceny
                  </Text>
                </TouchableOpacity>

                {!isEventFinished && (
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 11,
                      marginTop: 6,
                      textAlign: "right",
                    }}
                  >
                    Ocenisz po zakończeniu
                  </Text>
                )}

                {isEventFinished && ratingRequired && (
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 11,
                      marginTop: 6,
                      textAlign: "right",
                    }}
                  >
                    Ocena wymagana przed wyjściem
                  </Text>
                )}
              </View>
            </View>

            {isExpanded && (
              <FlatList
                data={participants}
                keyExtractor={(item) => String(item?.id ?? item?.userId ?? Math.random())}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Brak uczestników</Text>
                }
                renderItem={({ item }) => {
                  const uid = resolveUserIdFromParticipant(item);
                  const e = uid ? getUserEntry(uid) : null;

                  const isMe = myId != null && uid != null && Number(uid) === myId;

                  const avatar = resolveAvatarFromParticipant(item);

                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (!uid) return;
                        const fallback = buildFallbackProfileFromItem(item);
                        openUserDetailsModal(uid, fallback);
                      }}
                      style={[
                        styles.participantCard,
                        isMe
                          ? {
                              borderWidth: 1,
                              borderColor: "rgba(30,58,138,0.25)",
                              backgroundColor: "rgba(234,246,255,0.55)",
                            }
                          : null,
                      ]}
                    >
                      <View style={styles.avatar}>
                        {avatar ? (
                          <Image
                            source={{ uri: avatar }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                          />
                        ) : (
                          <Text style={styles.avatarText}>
                            {resolveUserNameFromParticipant(item)
                              ?.charAt(0)
                              .toUpperCase()}
                          </Text>
                        )}
                      </View>

                      <View style={{ flexDirection: "column", marginLeft: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={styles.userName}>
                            {resolveUserNameFromParticipant(item)}
                          </Text>

                          {isMe ? <MeBadge /> : null}

                          <RatingBadge avg={e?.avg} count={e?.count} />
                        </View>

                        {resolveAgeFromParticipant(item) ? (
                          <Text style={{ color: "#777", fontSize: 12 }}>
                            Wiek: {resolveAgeFromParticipant(item)}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>

          <View style={[styles.chatContainer, { flex: 1, justifyContent: "flex-end" }]}>
            <ChatBox messages={messages} onSend={handleSendMessage} />
          </View>

          {/* MODAL OCEN */}
          <RateParticipantsModal
            visible={showRatingModal}
            eventId={currentEventId ?? ""}
            onSubmitted={() => {
              setRatingCompleted(true);
              setRatingRequired(false);
              setShowRatingModal(false);
              router.replace("/(auth)/Event");
            }}
            onClose={() => {
              if (isEventFinished && ratingRequired) {
                Alert.alert(
                  "Dokończ ocenę",
                  "Aby wyjść z pokoju, musisz wysłać oceny."
                );
                return;
              }

              setShowRatingModal(false);
              fetchEventRatings();
            }}
            participants={participantsForRating}
            excludeUserId={myId ?? undefined}
            eventTitle={currentEvent?.location || "Wydarzenie"}
            isEventFinished={isEventFinished}
          />

          {/* MODAL PROFILU */}
          <ParticipantDetailsModal
            visible={detailsModalVisible}
            onClose={() => {
              setDetailsModalVisible(false);
              setSelectedParticipant(null);
              setSelectedRating(null);
              setSelectedTags([]);
            }}
            participant={selectedParticipant}
            rating={selectedRating}
            tags={selectedTags}
            participants={participants}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LocalEventRoom;
