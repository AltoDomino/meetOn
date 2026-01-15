import ChatBox, { Message } from "@/components/ChatBox";
import ParticipantDetailsModal from "@/components/ParticipantDetailsModal";
import RateParticipantsModal from "@/components/RateParticipants";
import { useEndEventListener } from "@/hooks/useEndEventListener";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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

const socket = io("https://meeton-backend-ffmo.onrender.com", {
  transports: ["websocket"],
});

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
      <Ionicons name="star" size={14} color="#3A8FB7" />
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

/**
 * ✅ KLUCZOWE: wyciąga PRAWDZIWE User.id z obiektu participant
 * Bo często item.id bywa EventParticipant.id i wtedy wszystko się miesza.
 */
function resolveUserIdFromParticipant(p: any): number | null {
  const candidates = [
    p?.userId,
    p?.user?.id,
    p?.user?.userId,
    p?.participant?.userId,
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
    p?.user?.userName ??
    p?.user?.username ??
    p?.user?.name ??
    "Użytkownik"
  );
}

function resolveAvatarFromParticipant(p: any): string | null {
  return (p?.avatar ??
    p?.avatarUrl ??
    p?.user?.avatar ??
    p?.user?.avatarUrl ??
    null) as string | null;
}

function resolveAgeFromParticipant(p: any): number | null {
  const a = p?.age ?? p?.user?.age;
  return typeof a === "number" ? a : null;
}

const LocalEventRoom = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, userName } = useAuth();

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

  // ✅ MAPA OCEN Z EVENTU: userId -> {avg,count,tags[{tag,count}]}
  const [eventRatingsMap, setEventRatingsMap] = useState<
    Record<number, RatingsEntry>
  >({});

  const fetchEventDetails = useCallback(async () => {
    if (!currentEventId) return;

    try {
      const res = await fetch(
        `https://meeton-backend-ffmo.onrender.com/api/event/${currentEventId}/details`
      );
      const data = await res.json();
      setCurrentEvent(data);
      setParticipants(data.participants || []);

      // ✅ log: sprawdź strukturę participants (raz na fetch)
      console.log(
        "[DETAILS] participants sample:",
        (data.participants || [])?.[0]
      );
    } catch (err) {
      console.error("Błąd pobierania szczegółów wydarzenia:", err);
    }
  }, [currentEventId]);

  // ✅ pobierz ratingi + tagi(count) dla całego eventu
  const fetchEventRatings = useCallback(async () => {
    if (!currentEventId) return;

    const url = `https://meeton-backend-ffmo.onrender.com/api/events/${currentEventId}/ratings`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log("[event ratings] url:", url);
      console.log("[event ratings] raw:", data);

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

      console.log("[event ratings] map keys:", Object.keys(nextMap));
      const firstKey = Object.keys(nextMap)[0];
      if (firstKey)
        console.log(
          "[event ratings] sample tags:",
          nextMap[Number(firstKey)]?.tags
        );

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

  // ✅ po zakończeniu eventu / po ocenianiu – odśwież
  useEffect(() => {
    if (showRatingModal) {
      fetchEventDetails();
      fetchEventRatings();
    }
  }, [showRatingModal, fetchEventDetails, fetchEventRatings]);

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

  // ✅ otwieramy modal po kliknięciu w usera: używamy PRAWDZIWEGO User.id
  const openUserDetailsModal = useCallback(
    async (targetUserId: number) => {
      try {
        const profileRes = await fetch(
          `https://meeton-backend-ffmo.onrender.com/api/user/profile/${targetUserId}`
        );
        const profile = await profileRes.json();

        const keyId =
          toNum(profile?.id) ?? toNum(profile?.userId) ?? toNum(targetUserId);

        const entry = keyId ? eventRatingsMap[keyId] : undefined;

        setSelectedParticipant(profile);
        setSelectedRating(
          entry ? { avg: entry.avg, count: entry.count } : null
        );
        setSelectedTags(entry?.tags ?? []);
        setDetailsModalVisible(true);
      } catch (err) {
        console.error("Błąd pobierania danych użytkownika:", err);
      }
    },
    [eventRatingsMap]
  );

  const handleLeave = async () => {
    const numericEventId = Number(currentEventId);
    if (!userId || !currentEventId || Number.isNaN(numericEventId)) return;

    try {
      const res = await fetch(
        "https://meeton-backend-ffmo.onrender.com/api/leave",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, eventId: numericEventId }),
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
    router.replace("./MyEvents");
  };

  // ✅ Creator info z eventu (to jest User.id)
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

  const creatorName =
    currentEvent?.creator?.userName ??
    currentEvent?.creator?.username ??
    currentEvent?.creatorName ??
    "Twórca";

  const creatorAvatar =
    currentEvent?.creator?.avatar ?? currentEvent?.creator?.avatarUrl ?? null;

  const getUserEntry = useCallback(
    (uid?: number | null) => {
      if (!uid) return null;
      return eventRatingsMap[uid] ?? null;
    },
    [eventRatingsMap]
  );

  // ✅ lista do oceniania: MUSI mieć User.id
  const participantsForRating = useMemo(() => {
    const list: any[] = [];

    (participants || []).forEach((p: any) => {
      const uid = resolveUserIdFromParticipant(p);
      if (!uid) return;

      list.push({
        id: uid, // ✅ TU JEST USER.ID
        userName: resolveUserNameFromParticipant(p),
        avatar: resolveAvatarFromParticipant(p),
        age: resolveAgeFromParticipant(p),
      });
    });

    if (creatorId && creatorName) {
      list.push({
        id: creatorId,
        userName: creatorName,
        avatar: creatorAvatar,
      });
    }

    const map = new Map<number, any>();
    for (const p of list) map.set(p.id, p);
    return Array.from(map.values());
  }, [participants, creatorId, creatorName, creatorAvatar]);

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
            headerStyle: { backgroundColor: "#3A8FB7" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            headerLeft: () => null,
          }}
        />

        <View style={[styles.container, { flex: 1 }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={[styles.eventInfo, { flex: 1 }]}>
              {/* ✅ Twórca / miejsce / czas POD SOBĄ */}
              {creatorId ? (
                <TouchableOpacity
                  onPress={() => openUserDetailsModal(creatorId)}
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
                    {creatorAvatar ? (
                      <Image
                        source={{ uri: creatorAvatar }}
                        style={{ width: 38, height: 38 }}
                      />
                    ) : (
                      <Text
                        style={{
                          fontWeight: "900",
                          color: "#3A8FB7",
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

            {/* ✅ Buttony pod sobą */}
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

              <TouchableOpacity
                onPress={() => {
                  if (!currentEventId) return;
                  setShowRatingModal(true);
                }}
                disabled={!currentEventId}
                style={{
                  backgroundColor: "#517fc5ff",
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  opacity: currentEventId ? 1 : 0.5,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}
                >
                  Oceny
                </Text>
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <FlatList
                data={participants}
                keyExtractor={(item) => String(item?.id ?? Math.random())}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Brak uczestników</Text>
                }
                renderItem={({ item }) => {
                  const uid = resolveUserIdFromParticipant(item);

                  // ✅ debug: zobacz jakie id ma participant
                  console.log("[LIST] participant raw:", item);
                  console.log("[LIST] resolved uid:", uid);

                  const e = uid ? getUserEntry(uid) : null;

                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (!uid) return;
                        openUserDetailsModal(uid);
                      }}
                      style={styles.participantCard}
                    >
                      <View style={styles.avatar}>
                        {resolveAvatarFromParticipant(item) ? (
                          <Image
                            source={{
                              uri: resolveAvatarFromParticipant(item)!,
                            }}
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
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.userName}>
                            {resolveUserNameFromParticipant(item)}
                          </Text>
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

          <View
            style={[
              styles.chatContainer,
              { flex: 1, justifyContent: "flex-end" },
            ]}
          >
            <ChatBox messages={messages} onSend={handleSendMessage} />
          </View>

          {/* MODAL OCEN */}
          <RateParticipantsModal
            visible={showRatingModal}
            eventId={currentEventId ?? ""}
            onClose={() => {
              setShowRatingModal(false);
              // ✅ po zapisaniu ocen od razu odśwież mapę eventową
              fetchEventRatings();
            }}
            participants={participantsForRating}
            excludeUserId={typeof userId === "number" ? userId : undefined}
            eventTitle={currentEvent?.location || "Wydarzenie"}
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
            tags={selectedTags} // ✅ [{tag,count}]
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LocalEventRoom;
