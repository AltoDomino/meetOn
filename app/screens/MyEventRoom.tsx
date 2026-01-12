import ChatBox, { Message } from "@/components/ChatBox";
import RateParticipantsModal from "@/components/RateParticipants"; // ✅ DODANE
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/MyEventRoom.styles";
import type { Event } from "./MyEvents";
import { useEndEventListener } from "@/hooks/useEndEventListener";

const socket = io("https://meeton-backend-ffmo.onrender.com", {
  transports: ["websocket"],
});

type Participant = {
  id: number;
  userName: string;
  avatar: string | null;
  description: string;
  age?: number;
};

const EventRoomScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { location, startDate, endDate, eventId } = useLocalSearchParams();
  const { userId, userName } = useAuth();

  // ✅ ujednolicone eventId (string albo undefined)
  const currentEventId =
    typeof eventId === "string"
      ? eventId
      : Array.isArray(eventId)
      ? eventId[0]
      : undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 🔥 nadal działa, jeśli event:ended przyjdzie z serwera
  const { showRatingModal, setShowRatingModal } = useEndEventListener({
    socket,
    currentEventId,
  });

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(
        `https://meeton-backend-ffmo.onrender.com/api/event/${currentEventId ?? eventId}/details`
      );
      const data = await res.json();
      setCurrentEvent(data);
      setParticipants(data.participants);
    } catch (err) {
      console.error("Błąd pobierania szczegółów wydarzenia:", err);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchParticipantDetails = async (participantId: number) => {
    const participant = participants.find((p) => p.id === participantId);
    if (participant) {
      setSelectedParticipant(participant);
      setModalVisible(true);
    }
  };

  useEffect(() => {
    if (!currentEventId) return;

    socket.emit("joinRoom", currentEventId);

    socket.on("message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("participantJoined", fetchEventDetails);
    socket.on("participantLeft", fetchEventDetails);

    return () => {
      socket.emit("leaveRoom", currentEventId);
      socket.off("message");
      socket.off("participantJoined");
      socket.off("participantLeft");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEventId]);

  const handleSendMessage = (content: string) => {
    if (!currentEventId || !userName) return;

    socket.emit("sendMessage", {
      eventId: currentEventId,
      content,
      sender: userName,
    });
  };

  const canDeleteEvent =
    currentEvent &&
    currentEvent.creator?.userName === userName &&
    participants.length === 0;

  const handleDeleteEvent = () => {
    Alert.alert(
      "Usuń wydarzenie",
      "Czy na pewno chcesz usunąć to wydarzenie? Tej operacji nie można cofnąć.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            if (!currentEvent) return;

            try {
              const res = await fetch(
                `https://meeton-backend-ffmo.onrender.com/api/event/${currentEvent.id}`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId }),
                }
              );

              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                  errorData.error || "Błąd podczas usuwania wydarzenia"
                );
              }

              Alert.alert("Wydarzenie zostało usunięte");
              router.push("/screens/MyEvents");
            } catch (error: unknown) {
              Alert.alert(
                "Błąd",
                error instanceof Error ? error.message : "Nieznany błąd"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          paddingBottom: Platform.OS === "android" ? insets.bottom + 20 : 0,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 80 : 0}
      >
        <View style={styles.container}>
          <Stack.Screen
            options={{
              title: "MOJE WYDARZENIA",
              headerStyle: {
                backgroundColor: "#00A9F4",
              },
              headerTintColor: "#fff",
              headerTitleAlign: "center",
            }}
          />

          <View style={styles.header}>
            <View style={styles.eventInfo}>
              <Text style={styles.title}>{location}</Text>
              <Text>
                {new Date(
                  Array.isArray(startDate) ? startDate[0] : startDate
                ).toLocaleString()}{" "}
                -{" "}
                {new Date(
                  Array.isArray(endDate) ? endDate[0] : endDate
                ).toLocaleTimeString()}
              </Text>
            </View>

            {canDeleteEvent && (
              <TouchableOpacity
                style={styles.leaveButtonWrapper}
                onPress={handleDeleteEvent}
              >
                <View style={styles.leaveTextWrapper}>
                  <Text style={styles.leaveButton}>Usuń</Text>
                  <Text style={styles.leaveButton}>wydarzenie</Text>
                </View>
                <Ionicons
                  name="exit-outline"
                  size={18}
                  color="#999"
                  style={styles.leaveIcon}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* ✅ uczestnicy + przycisk OCENY */}
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

              {/* ✅ tymczasowo: ręczne otwieranie oceny */}
              <TouchableOpacity
                onPress={() => setShowRatingModal(true)}
                style={{
                  backgroundColor: "#517fc5ff",
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                  Oceny
                </Text>
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <FlatList
                data={participants}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Brak uczestników</Text>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => fetchParticipantDetails(item.id)}
                    style={styles.participantCard}
                  >
                    <View style={styles.avatar}>
                      {item.avatar && item.avatar.trim() !== "" ? (
                        <Image
                          source={{ uri: item.avatar }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                          }}
                        />
                      ) : (
                        <Text style={styles.avatarText}>
                          {item.userName?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: "column", marginLeft: 10 }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={styles.userName}>{item.userName}</Text>
                        {item.id === userId && (
                          <Text
                            style={{
                              marginLeft: 6,
                              fontSize: 12,
                              color: "#00A9F4",
                            }}
                          >
                            👤
                          </Text>
                        )}
                      </View>
                      {item.age && (
                        <Text style={{ color: "#777", fontSize: 12 }}>
                          Wiek: {item.age}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          <View style={styles.chatContainer}>
            <ChatBox messages={messages} onSend={handleSendMessage} />
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 🔹 MODAL Z PROFILEM UCZESTNIKA */}
      {selectedParticipant && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          statusBarTranslucent
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 10,
                width: "80%",
                alignItems: "center",
              }}
            >
              {selectedParticipant.avatar &&
              selectedParticipant.avatar.trim() !== "" ? (
                <Image
                  source={{ uri: selectedParticipant.avatar }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    marginBottom: 10,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>
                    {selectedParticipant.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {selectedParticipant.userName}
              </Text>
              {selectedParticipant.age && (
                <Text style={{ marginTop: 4, color: "#555" }}>
                  Wiek: {selectedParticipant.age}
                </Text>
              )}
              <Text style={{ marginTop: 10, textAlign: "center" }}>
                {selectedParticipant.description || "Brak opisu"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ marginTop: 15 }}
              >
                <Text style={{ color: "#007AFF" }}>Zamknij</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ✅ MODAL OCEN – Twoja gotowa mechanika */}
      <RateParticipantsModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        eventId={currentEventId ?? ""} // ✅ bez TS error
        participants={participants}
        excludeUserId={typeof userId === "number" ? userId : undefined}
        eventTitle={typeof location === "string" ? location : "Wydarzenie"}
      />
    </>
  );
};

export default EventRoomScreen;
