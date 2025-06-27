import ChatBox from "@/components/Chtabox";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/EventScreenRoom.styles";

const EventRoomScreen = () => {
  const router = useRouter();
  const { location, startDate, endDate, eventId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const { userId } = useAuth();
  
  useEffect(() => {
    // pobierz wiadomości i uczestników
    // TODO: fetch(`/api/event/${eventId}/details`)
  }, []);

  const handleLeave = async () => {
    if (!userId || !eventId) return;

    try {
      const res = await fetch("http://192.168.1.26:3000/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, eventId: Number(eventId) }),
      });

      if (res.ok) {
        router.back(); // wraca na listę, która się automatycznie odświeży
      } else {
        const data = await res.json();
        alert(data.error || "Błąd opuszczania wydarzenia");
      }
    } catch (err) {
      console.error("Błąd opuszczania:", err);
      alert("Nie udało się połączyć z serwerem");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Wydarzenie",
          headerStyle: {
            backgroundColor: "#00A9F4",
          },
          headerTintColor: "#fff", // ikony i tekst nagłówka na biało
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.eventInfo}>
            <Text style={styles.title}>{location}</Text>
            <Text>
              {new Date(startDate).toLocaleString()} -{" "}
              {new Date(endDate).toLocaleTimeString()}
            </Text>
          </View>

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
        </View>

        <View style={styles.participantsContainer}>
          <Text style={styles.participantsTitle}>Uczestnicy wydarzenia:</Text>
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.participantCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.userName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userName}>{item.userName}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.chatContainer}>
          <ChatBox messages={messages} />
        </View>
      </View>
    </>
  );
};

export default EventRoomScreen;
