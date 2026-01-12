import ChatBox, { Message } from "@/components/ChatBox";
import RateParticipantsModal from "@/components/RateParticipants";
import { useEndEventListener } from "@/hooks/useEndEventListener";
import { useEventRatings } from "@/hooks/useEventRatings";
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
      <Ionicons name="star" size={14} color="#00A9F4" />
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

const LocalEventRoom = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, userName } = useAuth();

  const currentEventId = useMemo(() => {
    const raw = (params as any)?.eventId;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  }, [params]);

  // ✅ Hook z ocenami eventu
  const { getUserRating, refetch: refetchRatings } = useEventRatings(currentEventId);

  const [participants, setParticipants] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreatorDescModalVisible, setIsCreatorDescModalVisible] = useState(false);

  const { showRatingModal, setShowRatingModal } = useEndEventListener({
    socket,
    currentEventId,
  });

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

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  // ✅ Jak modal ocen się otworzy (event:ended albo ręcznie), odśwież dane + oceny
  useEffect(() => {
    if (showRatingModal) {
      fetchEventDetails();
      refetchRatings();
    }
  }, [showRatingModal, fetchEventDetails, refetchRatings]);

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

  const fetchParticipantDetails = async (participantId: number) => {
    try {
      const res = await fetch(
        `https://meeton-backend-ffmo.onrender.com/api/user/profile/${participantId}`
      );
      const data = await res.json();
      setSelectedParticipant(data);
      setModalVisible(true);
    } catch (err) {
      console.error("Błąd pobierania danych uczestnika:", err);
    }
  };

  const handleLeave = async () => {
    const numericEventId = Number(currentEventId);
    if (!userId || !currentEventId || Number.isNaN(numericEventId)) return;

    try {
      const res = await fetch("https://meeton-backend-ffmo.onrender.com/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, eventId: numericEventId }),
      });

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

  const participantsForRating = useMemo(() => {
    const list: any[] = [];

    (participants || []).forEach((p: any) => {
      const idNum = Number(p?.id);
      if (!Number.isNaN(idNum) && idNum > 0) {
        list.push({
          id: idNum,
          userName: p?.userName ?? p?.username ?? p?.name ?? "Użytkownik",
          avatar: p?.avatar ?? p?.avatarUrl ?? null,
          age: typeof p?.age === "number" ? p.age : null,
        });
      }
    });

    const creator = currentEvent?.creator;
    const creatorName = creator?.userName;

    let creatorIdFromParticipants: number | null = null;
    if (creatorName) {
      const found = (participants || []).find(
        (p: any) => String(p?.userName ?? p?.username ?? p?.name ?? "") === String(creatorName)
      );
      const idNum = Number(found?.id);
      if (!Number.isNaN(idNum) && idNum > 0) creatorIdFromParticipants = idNum;
    }

    const creatorIdCandidates = [
      currentEvent?.creatorId,
      currentEvent?.ownerId,
      currentEvent?.hostId,
      currentEvent?.createdById,
      creator?.id,
    ];

    let creatorIdFromEvent: number | null = null;
    for (const c of creatorIdCandidates) {
      const n = Number(c);
      if (!Number.isNaN(n) && n > 0) {
        creatorIdFromEvent = n;
        break;
      }
    }

    const finalCreatorId = creatorIdFromParticipants ?? creatorIdFromEvent;

    if (finalCreatorId && creatorName) {
      list.push({
        id: finalCreatorId,
        userName: creatorName,
        avatar: creator?.avatar ?? null,
        age: typeof creator?.age === "number" ? creator.age : null,
      });
    }

    const map = new Map<number, any>();
    for (const p of list) map.set(p.id, p);

    return Array.from(map.values());
  }, [participants, currentEvent]);

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
            headerStyle: { backgroundColor: "#00A9F4" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            headerLeft: () => null,
          }}
        />

        <View style={[styles.container, { flex: 1 }]}>
          {/* Szczegóły wydarzenia */}
          <View style={styles.header}>
            <View style={styles.eventInfo}>
              <Text style={styles.title}>{currentEvent?.location || "Brak lokalizacji"}</Text>
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

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.leaveButtonWrapper} onPress={handleLeave}>
                <View style={styles.leaveTextWrapper}>
                  <Text style={styles.leaveButton}>Opuść</Text>
                  <Text style={styles.leaveButton}>wydarzenie</Text>
                </View>
                <Ionicons name="exit-outline" size={18} color="#999" style={styles.leaveIcon} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.leaveButtonWrapper} onPress={handleSwitch}>
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.participantsTitle}>
                  {isExpanded ? "Ukryj uczestników ▲" : "Pokaż uczestników ▼"}
                </Text>
              </TouchableOpacity>

              {/* ✅ Przycisk testowy – ręczne otwieranie modala */}
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
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Oceny</Text>
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <FlatList
                data={participants}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Brak uczestników</Text>}
                renderItem={({ item }) => {
                  const r = getUserRating(item.id);

                  return (
                    <TouchableOpacity
                      onPress={() => fetchParticipantDetails(item.id)}
                      style={styles.participantCard}
                    >
                      <View style={styles.avatar}>
                        {item.avatar && item.avatar.trim() !== "" ? (
                          <Image
                            source={{ uri: item.avatar }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                          />
                        ) : (
                          <Text style={styles.avatarText}>
                            {item.userName?.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>

                      <View style={{ flexDirection: "column", marginLeft: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={styles.userName}>{item.userName}</Text>

                          {/* ✅ Ocena obok imienia */}
                          <RatingBadge avg={r?.avg} count={r?.count} />

                          {item.id === userId && (
                            <Text style={{ marginLeft: 6, fontSize: 12, color: "#00A9F4" }}>
                              👤
                            </Text>
                          )}
                        </View>

                        {item.age && (
                          <Text style={{ color: "#777", fontSize: 12 }}>Wiek: {item.age}</Text>
                        )}
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

          {/* ✅ MODAL OCEN */}
          <RateParticipantsModal
            visible={showRatingModal}
            eventId={currentEventId ?? ""} // ✅ bez ! i bez undefined
            onClose={() => {
              setShowRatingModal(false);
              refetchRatings(); // ✅ po ocenieniu odśwież
            }}
            participants={participantsForRating}
            excludeUserId={typeof userId === "number" ? userId : undefined}
            eventTitle={currentEvent?.location || "Wydarzenie"}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LocalEventRoom;
