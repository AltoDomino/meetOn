import ChatBox, { Message } from "@/components/ChatBox";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/FrielndList.styles";
import FriendRequests from "../InviteFriends/FriendsRequest";
import SendFriendRequest from "../InviteFriends/SendFriendRequest";

type Friend = {
  id: number;
  userName: string;
};

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

export default function FriendsList() {
  const { userId, userName } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatWith, setChatWith] = useState<Friend | null>(null);

  // socket + wiadomości per pokój
  const socketRef = useRef<Socket | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>({});

  // aktualnie otwarty pokój (dla fallbacku gdy msg.roomId brak)
  const roomId = useMemo(() => {
    if (!userId || !chatWith) return null;
    const a = Math.min(userId, chatWith.id);
    const b = Math.max(userId, chatWith.id);
    return `dm:${a}_${b}`;
  }, [userId, chatWith]);

  const currentRoomRef = useRef<string | null>(null);
  useEffect(() => {
    currentRoomRef.current = roomId ?? null;
  }, [roomId]);

  const ensureSocket = () => {
    if (!socketRef.current) {
      const s = io(BACKEND_URL, { transports: ["websocket"] });
      socketRef.current = s;

      // historia od serwera po joinRoom
      s.on("history", (payload: { roomId: string; messages: Message[] }) => {
        const { roomId, messages } = payload;
        if (!roomId || !Array.isArray(messages)) return;
        setMessagesByRoom((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] ?? []), ...messages],
        }));
      });

      // pojedyncze wiadomości na żywo
      s.on("message", (msg: Message & { roomId?: string }) => {
        const rid = msg.roomId ?? currentRoomRef.current; // fallback na bieżący pokój
        if (!rid) return;
        setMessagesByRoom((prev) => ({
          ...prev,
          [rid]: [...(prev[rid] ?? []), msg],
        }));
      });
    }
    return socketRef.current!;
  };

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/invite-friends/${userId}`);
      const data = await res.json();
      setFriends(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Błąd pobierania znajomych:", error);
    }
  };

  useEffect(() => {
    if (userId) fetchFriends();
  }, [userId]);

  const refreshWithDelay = () => setTimeout(fetchFriends, 1000);

  const openChat = (friend: Friend) => {
    setChatWith(friend);
    setChatVisible(true);

    const s = ensureSocket();
    const a = Math.min(userId!, friend.id);
    const b = Math.max(userId!, friend.id);
    const rid = `dm:${a}_${b}`;

    // join + opcjonalnie zapewnij strukturę w stanie
    s.emit("joinRoom", rid);
    setMessagesByRoom((prev) => (prev[rid] ? prev : { ...prev, [rid]: [] }));
  };

  const closeChat = () => {
    setChatVisible(false); // nie czyścimy historii
  };

  const handleSend = (text: string) => {
    if (!roomId || !chatWith) return;
    const s = ensureSocket();

    const msg: Message & { roomId: string } = {
      sender: userName,
      content: text,
      timestamp: new Date().toISOString(),
      roomId,
    };

    // optymistycznie do UI
    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] ?? []), msg],
    }));

    // na serwer (eventId == roomId)
    s.emit("sendMessage", { eventId: roomId, content: text, sender: userName });
  };

  const activeMessages: Message[] = roomId ? messagesByRoom[roomId] ?? [] : [];

  return (
    <View style={styles.container}>
      <FriendRequests onAccepted={refreshWithDelay} />
      <SendFriendRequest onRequestSent={refreshWithDelay} />

      <Text style={styles.title}>Twoi znajomi</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.userName}</Text>

              <TouchableOpacity style={styles.chatButton} onPress={() => openChat(item)}>
                <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                <Text style={styles.chatButtonText}>Wiadomość</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal czatu */}
      <Modal visible={chatVisible} animationType="slide" onRequestClose={closeChat}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // podbij jeśli header wyższy
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.chatModalHeader}>
              <Text style={styles.chatModalTitle}>Czat z {chatWith?.userName ?? ""}</Text>
              <TouchableOpacity onPress={closeChat} style={styles.chatModalClose}>
                <Text style={styles.chatModalCloseText}>Zamknij</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chatContainer}>
              <ChatBox messages={activeMessages} onSend={handleSend} />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
