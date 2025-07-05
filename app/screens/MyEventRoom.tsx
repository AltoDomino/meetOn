import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import type { Event } from "../(auth)/Event";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/EventScreenRoom.styles";
import ChatBox from "@/components/Chtabox";

type Participant = {
  id: number;
  userName: string;
};

const EventRoomScreen = () => {
  const router = useRouter();
  const { location, startDate, endDate, eventId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { userId, userName } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await fetch(
          `http://192.168.1.26:3000/api/event/${eventId}/details`
        );
        const data = await res.json();
        console.log(data, "info o moim iwencie");
        setCurrentEvent(data);
        setParticipants(data.participants);
      } catch (err) {
        console.error("Błąd pobierania szczegółów wydarzenia:", err);
      }
    };

    fetchEventDetails();
  }, []);

  const canDeleteEvent =
    currentEvent &&
    currentEvent?.creator?.userName === userName &&
    currentEvent.participantsCount === 1;

  const handleDeleteEvent = async () => {
    if (!currentEvent) return;

    try {
      const res = await fetch(`/api/events/${currentEvent.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Błąd podczas usuwania wydarzenia");

      Alert.alert("Sukces", "Wydarzenie zostało usunięte");
      router.push("/screens/MyEvents");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Błąd", error.message);
      } else {
        Alert.alert("Błąd", "Nieznany błąd");
      }
    }
  };

  return (
    <>
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
