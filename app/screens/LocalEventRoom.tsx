import ChatBox, { Message } from "@/components/ChatBox";
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
  Modal,
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
import type { Event } from "./MyEvents";

const socket = io("https://meeton-backend-ffmo.onrender.com", {
  transports: ["websocket"],
});

const LocalEventRoom = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, userName } = useAuth();

  const currentEventId = useMemo(() => {
    const raw = (params as any)?.eventId;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  }, [params]);

  const [participants, setParticipants] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null); // <- any, bo backend zwraca różne pola
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
    if (!userId || !currentEventId || isNaN(numericEventId)) return;

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

  /**
   * ✅ Najważniejsze:
   * - participants są ok (mają id)
   * - creator z backendu NIE MA id
   * - więc próbujemy znaleźć creatorId w innych polach eventa
   */
  const participantsForRating = useMemo(() => {
    const list: any[] = [];

    // 1) participants (z id)
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

    // 2) (stary sposób) spróbuj znaleźć gospodarza w participants po userName
    let creatorIdFromParticipants: number | null = null;
    if (creatorName) {
      const found = (participants || []).find(
        (p: any) =>
          String(p?.userName ?? p?.username ?? p?.name ?? "") === String(creatorName)
      );
      const idNum = Number(found?.id);
      if (!Number.isNaN(idNum) && idNum > 0) creatorIdFromParticipants = idNum;
    }

    // 3) (NOWY sposób) spróbuj znaleźć creatorId po innych polach eventa
    const creatorIdCandidates = [
      currentEvent?.creatorId,
      currentEvent?.ownerId,
      currentEvent?.hostId,
      currentEvent?.createdById,
      creator?.id, // jak kiedyś backend zacznie zwracać
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

    // 4) jeśli mamy finalCreatorId → dodaj gospodarza do listy ocen
    if (finalCreatorId && creatorName) {
      list.push({
        id: finalCreatorId,
        userName: creatorName,
        avatar: creator?.avatar ?? null,
        age: typeof creator?.age === "number" ? creator.age : null,
      });
    }

    // 5) dedupe po id
    const map = new Map<number, any>();
    for (const p of list) map.set(p.id, p);

    return Array.from(map.values());
  }, [participants, currentEvent]);

  useEffect(() => {
    if (!showRatingModal) return;

    console.log("LOG CREATOR RAW:", currentEvent?.creator);
    console.log("LOG CREATOR ID candidates:", {
      creatorId: currentEvent?.creatorId,
      ownerId: currentEvent?.ownerId,
      hostId: currentEvent?.hostId,
      createdById: currentEvent?.createdById,
      creatorObjId: currentEvent?.creator?.id,
    });
    console.log("LOG participants:", participants);
    console.log("LOG participantsForRating:", participantsForRating);
    console.log("LOG my userId:", userId);
  }, [showRatingModal, currentEvent, participants, participantsForRating, userId]);

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
          {/* Twórca wydarzenia */}
          {currentEvent?.creator && (
            <View style={styles.creatorContainer}>
              {currentEvent.creator.avatar && currentEvent.creator.avatar.trim() !== "" ? (
                <Image
                  source={{ uri: currentEvent.creator.avatar }}
                  style={styles.creatorAvatar}
                />
              ) : (
                <View style={styles.creatorInitial}>
                  <Text style={styles.creatorInitialText}>
                    {currentEvent.creator.userName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.creatorTextContainer}>
                <Text style={styles.creatorName}>{currentEvent.creator.userName}</Text>

                {currentEvent.creator.age && (
                  <Text style={styles.creatorAge}>Wiek: {currentEvent.creator.age}</Text>
                )}

                {currentEvent.creator.description && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <Text style={styles.creatorDescription}>
                      {currentEvent.creator.description.length > 10
                        ? currentEvent.creator.description.slice(0, 10) + "..."
                        : currentEvent.creator.description}
                    </Text>

                    {currentEvent.creator.description.length > 10 && (
                      <TouchableOpacity onPress={() => setIsCreatorDescModalVisible(true)}>
                        <Text
                          style={{
                            color: "#00A9F4",
                            marginLeft: 6,
                            fontWeight: "bold",
                          }}
                        >
                          Rozwiń opis
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Szczegóły wydarzenia */}
          <View style={styles.header}>
            <View style={styles.eventInfo}>
              <Text style={styles.title}>{currentEvent?.location || "Brak lokalizacji"}</Text>
              <Text>
                {currentEvent?.startDate ? new Date(currentEvent.startDate).toLocaleDateString() : ""}{" "}
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
                <Ionicons name="swap-vertical-outline" size={18} color="#999" style={styles.leaveIcon} />
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

              <TouchableOpacity
                onPress={() => setShowRatingModal(true)}
                style={{
                  backgroundColor: "#517fc5ff",
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
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
                renderItem={({ item }) => (
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
                        {item.id === userId && (
                          <Text style={{ marginLeft: 6, fontSize: 12, color: "#00A9F4" }}>👤</Text>
                        )}
                      </View>

                      {item.age && <Text style={{ color: "#777", fontSize: 12 }}>Wiek: {item.age}</Text>}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          <View style={[styles.chatContainer, { flex: 1, justifyContent: "flex-end" }]}>
            <ChatBox messages={messages} onSend={handleSendMessage} />
          </View>

          {/* MODAL OCEN */}
          <RateParticipantsModal
            visible={showRatingModal}
            eventId={currentEventId!}
            onClose={() => setShowRatingModal(false)}
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
