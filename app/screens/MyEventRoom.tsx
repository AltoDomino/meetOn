import ChatBox, { Message } from "@/components/ChatBox";
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
import { styles } from "../../styles/EventScreenRoom.styles";
import type { Event } from "../CreateEvent/Event";

const socket = io("https://meeton-backend-ffmo.onrender.com", {
  transports: ["websocket"],
});

type Participant = {
  id: number;
  userName: string;
  avatar: string | null;
  description: string;
};

const EventRoomScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { location, startDate, endDate, eventId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { userId, userName } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(
        `https://meeton-backend-ffmo.onrender.com/api/event/${eventId}/details`
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
  }, []);

  useEffect(() => {
    if (!eventId || typeof eventId !== "string") return;

    socket.emit("joinRoom", eventId);

    socket.on("message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("participantJoined", fetchEventDetails);
    socket.on("participantLeft", fetchEventDetails);

    return () => {
      socket.emit("leaveRoom", eventId);
      socket.off("message");
      socket.off("participantJoined");
      socket.off("participantLeft");
    };
  }, [eventId]);

  const handleSendMessage = (content: string) => {
    if (!eventId || typeof eventId !== "string" || !userName) return;

    socket.emit("sendMessage", {
      eventId,
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
              title: "Moje Wydarzenia",
              headerStyle: {
                backgroundColor: "#00A9F4",
              },
              headerTintColor: "#fff",
            }}
          />

          <View style={styles.header}>
            <View style={styles.eventInfo}>
              <Text style={styles.title}>{location}</Text>
              <Text>
                {new Date(
                  Array.isArray(startDate) ? startDate[0] : startDate
                ).toLocaleString()}{" "}
                -
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

          <View style={styles.participantsContainer}>
            <Text style={styles.participantsTitle}>Uczestnicy wydarzenia:</Text>
            <FlatList
              data={participants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.participantCard}
                  onPress={() => {
                    setSelectedParticipant(item);
                    setModalVisible(true);
                  }}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.userName?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.userName}>{item.userName}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.chatContainer}>
            <ChatBox messages={messages} onSend={handleSendMessage} />
          </View>
        </View>
      </KeyboardAvoidingView>

      {selectedParticipant && (
        <Modal visible={modalVisible} transparent animationType="fade">
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
    </>
  );
};

export default EventRoomScreen;
