import ChatBox, { Message } from "@/components/ChatBox";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import io from "socket.io-client";
import type { Event } from "../(auth)/Event";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/EventScreenRoom.styles";

const socket = io("https://meeton-backend-ffmo.onrender.com");

const LocalEventRoom = () => {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { userId, userName } = useAuth();

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

    socket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("participantJoined", fetchEventDetails);
    socket.on("participantLeft", fetchEventDetails);

    return () => {
      socket.emit("leaveRoom", eventId);
      socket.off("message");
      socket.off("participantJoined", fetchEventDetails);
      socket.off("participantLeft", fetchEventDetails);
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
    const numericEventId = Number(eventId);
    if (!userId || isNaN(numericEventId)) return;

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
        socket.emit("participantLeft", eventId);
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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Wydarzenie",
          headerStyle: { backgroundColor: "#00A9F4" },
          headerTintColor: "#fff",
          headerLeft: () => null,
        }}
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.eventInfo}>
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

          <View style={styles.buttonContainer}>
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

        {/* Uczestnicy */}
        <View style={styles.participantsContainer}>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.participantsTitle}>
              {isExpanded ? "Ukryj uczestników ▲" : "Pokaż uczestników ▼"}
            </Text>
          </TouchableOpacity>

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
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {item.userName?.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.userName}>{item.userName}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Czat */}
        <View style={styles.chatContainer}>
          <ChatBox messages={messages} onSend={handleSendMessage} />
        </View>

        {/* Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
                width: "80%",
                alignItems: "center",
              }}
            >
              {selectedParticipant?.avatarUrl &&
              selectedParticipant.avatarUrl.trim() !== "" ? (
                <Image
                  source={{ uri: selectedParticipant.avatarUrl }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 60,
                    marginBottom: 16,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontSize: 48 }}>
                    {selectedParticipant?.userName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text
                style={{ fontSize: 20, fontWeight: "bold", marginBottom: 5 }}
              >
                {selectedParticipant?.userName}
              </Text>
              <Text style={{ textAlign: "center", color: "#666" }}>
                {selectedParticipant?.description || "Brak opisu"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  marginTop: 20,
                  padding: 10,
                  backgroundColor: "#00A9F4",
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Zamknij
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default LocalEventRoom;
