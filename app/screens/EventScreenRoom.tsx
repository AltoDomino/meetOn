import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import UserAvatars from "@/components/UsersAvatars";
import ChatBox from "@/components/Chtabox";
import MessageInput from "@/components/MessageInput";

const EventRoomScreen = () => {
  const router = useRouter();
  const { location, startDate, endDate, eventId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // pobierz wiadomości i uczestników
    // TODO: fetch(`/api/event/${eventId}/details`)
  }, []);

  const handleLeave = () => {
    // TODO: request opuść wydarzenie
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{location}</Text>
          <Text>{new Date(startDate).toLocaleString()} - {new Date(endDate).toLocaleTimeString()}</Text>
        </View>
        <TouchableOpacity onPress={handleLeave}>
          <Text style={styles.leaveButton}>Opuść wydarzenie</Text>
        </TouchableOpacity>
      </View>

      <UserAvatars participants={participants} />

      <View style={styles.chatContainer}>
        <ChatBox messages={messages} />
        <MessageInput onSend={(msg) => {/* TODO: wysyłka */}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold" },
  leaveButton: { color: "red", fontWeight: "600" },
  chatContainer: { flex: 1, marginTop: 16 },
});

export default EventRoomScreen;
