import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/Event.styles";

const EventRoom = () => {
  const { location, startDate, endDate,  spots } =
    useLocalSearchParams();


const parsedStartDate = new Date(Array.isArray(startDate) ? startDate[0] : startDate);
const parsedEndDate = new Date(Array.isArray(endDate) ? endDate[0] : endDate);
  const [messages, setMessages] = useState([
    { id: "1", text: "Hej wszystkim!" },
    { id: "2", text: "Cześć! Do zobaczenia na miejscu." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: newMessage },
      ]);
      setNewMessage("");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.eventInfoBox}>
          <Text style={styles.eventText}>{location}</Text>
          <Text style={styles.eventSubText}>{new Date(parsedStartDate).toLocaleString()} - {new Date(parsedEndDate).toLocaleString()}</Text>
          {/* <Text style={styles.eventSubText}>Uczestnicy: {participants.length}/{spots}</Text> */}
        </View>
        <TouchableOpacity
          onPress={() => alert("Opuściłeś wydarzenie")}
          style={styles.leaveButton}
        >
          <Ionicons name="exit-outline" size={24} color="#fff" />
          <Text style={{ color: "#fff", marginLeft: 6 }}>Opuść</Text>
        </TouchableOpacity>
      </View>

      {/* <View style={styles.avatarContainer}>
        {participants.map((p) => (
          <Image
            key={p.id}
            source={{ uri: p.avatar }}
            style={styles.avatar}
          />
        ))}
      </View> */}

      {/* Chat */}
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.chatMessage}>{item.text}</Text>
          )}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
        <View style={styles.chatInputRow}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Napisz wiadomość..."
            style={styles.chatInput}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default EventRoom;
