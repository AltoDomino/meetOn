import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { styles } from "@/styles/ChatBox.styles";

export type Message = {
  sender: string;
  content: string;
  timestamp?: string;
};

interface ChatBoxProps {
  messages: Message[];
  onSend: (message: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSend }) => {
  const { userName } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender === userName;
    const time = item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <View
        style={[styles.messageRow, isMine ? styles.myMessage : styles.otherMessage]}
      >
        <View style={styles.bubble}>
          <Text style={styles.sender}>{isMine ? "Ty" : item.sender}</Text>
          <Text style={styles.content}>{item.content}</Text>
          <Text style={styles.timestamp}>{time}</Text>
        </View>
      </View>
    );
  };

  const handleSend = () => {
    if (input.trim() === "") return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <View style={styles.chatWrapper}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Napisz wiadomość..."
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatBox;
