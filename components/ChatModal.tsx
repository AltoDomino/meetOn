import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import io from "socket.io-client";
const socket = io("https://meeton-backend-ffmo.onrender.com", {
  transports: ["websocket"],
});

type Friend = { id: number; userName: string };

type ChatMessage = {
  id: string;
  text: string;
  createdAt: number;
  fromMe: boolean;
  sender?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  friend: Friend | null;
  userId?: number | null;

  // jeśli masz w AuthContext userName, przekaż go żeby "fromMe" działało idealnie
  userName?: string | null;
};

// ✅ deterministyczny roomId dla DM (obie strony zawsze trafią do tego samego pokoju)
const dmRoomId = (a: number, b: number) => {
  const [x, y] = [a, b].sort((m, n) => m - n);
  return `dm:${x}_${y}`;
};

export default function ChatModal({
  visible,
  onClose,
  friend,
  userId,
  userName,
}: Props) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const title = useMemo(() => {
    if (!friend) return "czat";
    return `czat z ${friend.userName}`;
  }, [friend]);

  const roomId = useMemo(() => {
    if (!userId || !friend?.id) return null;
    return dmRoomId(userId, friend.id);
  }, [userId, friend?.id]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  // ✅ JOIN/LEAVE + LISTENERS
  useEffect(() => {
    if (!visible) return;
    if (!friend) return;
    if (!userId) return;
    if (!roomId) return;

    setText("");
    setMessages([]);

    // (opcjonalnie) upewnij się, że socket jest połączony
    if (!socket.connected) socket.connect();

    // 1) join do pokoju DM
    socket.emit("joinRoom", roomId);

    // 2) historia (serwer emituje "history" tylko do dołączającego)
    const onHistory = ({
      roomId: rid,
      messages: hist,
    }: {
      roomId: string;
      messages: any[];
    }) => {
      if (rid !== roomId) return;

      const mapped: ChatMessage[] = (hist ?? []).map((m: any) => {
        const senderStr = String(m.sender ?? "");
        const mine = senderStr === (userName ?? String(userId));

        return {
          id: `srv:${m.timestamp ?? Date.now()}:${senderStr}:${Math.random()
            .toString(16)
            .slice(2)}`,
          text: String(m.content ?? ""),
          createdAt: m.timestamp ? new Date(m.timestamp).getTime() : Date.now(),
          fromMe: mine,
          sender: senderStr,
        };
      });

      setMessages(mapped);
    };

    // 3) nowe wiadomości
    const onMessage = (m: any) => {
      if (m?.roomId !== roomId) return;

      const senderStr = String(m.sender ?? "");
      const mine = senderStr === (userName ?? String(userId));

      const msg: ChatMessage = {
        id: `srv:${m.timestamp ?? Date.now()}:${senderStr}:${Math.random()
          .toString(16)
          .slice(2)}`,
        text: String(m.content ?? ""),
        createdAt: m.timestamp ? new Date(m.timestamp).getTime() : Date.now(),
        fromMe: mine,
        sender: senderStr,
      };

      setMessages((prev) => [...prev, msg]);
    };

    socket.on("history", onHistory);
    socket.on("message", onMessage);

    return () => {
      socket.off("history", onHistory);
      socket.off("message", onMessage);
      socket.emit("leaveRoom", roomId);
    };
  }, [visible, friend?.id, userId, roomId, userName]);

  useEffect(() => {
    if (!visible) return;
    scrollToEnd();
  }, [messages, visible]);

  // ✅ wysyłka przez socket do pokoju DM
  const send = () => {
    if (!friend || !userId || !roomId) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    // serwer oczekuje { eventId, content, sender }
    socket.emit("sendMessage", {
      eventId: roomId,
      content: trimmed,
      sender: userName ?? String(userId), // musi być string
    });

    setText("");
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const bubbleStyle = item.fromMe ? styles.bubbleMe : styles.bubbleOther;
    const textStyle = item.fromMe ? styles.bubbleTextMe : styles.bubbleTextOther;
    const rowStyle = item.fromMe ? styles.rowMe : styles.rowOther;

    return (
      <View style={[styles.msgRow, rowStyle]}>
        <View style={[styles.bubble, bubbleStyle]}>
          <Text style={[styles.bubbleText, textStyle]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.85}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={18} color="#EAF6FF" />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />

            <View style={styles.inputBar}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="napisz coś"
                placeholderTextColor="rgba(234,246,255,0.45)"
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={send}
              />

              <TouchableOpacity
                onPress={send}
                activeOpacity={0.85}
                style={styles.sendBtn}
              >
                <Ionicons name="arrow-forward" size={20} color="#0B1220" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  safe: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  kav: { width: "100%" },
  card: {
    width: "100%",
     height: Platform.OS === "ios" ? "80%" : "60%",
    backgroundColor: "#0B1220",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,169,244,0.35)",
      marginTop: Platform.OS === "android" ? -20 : 0,

  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(234,246,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerTitle: {
    color: "#EAF6FF",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "lowercase",
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(234,246,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    flexGrow: 1,
  },
  msgRow: { width: "100%", flexDirection: "row" },
  rowMe: { justifyContent: "flex-end" },
  rowOther: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  bubbleMe: {
    backgroundColor: "rgba(0,169,244,0.22)",
    borderColor: "rgba(0,169,244,0.45)",
    borderTopRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: "rgba(234,246,255,0.06)",
    borderColor: "rgba(234,246,255,0.10)",
    borderTopLeftRadius: 6,
  },
  bubbleText: { fontSize: 13, lineHeight: 18, fontWeight: "700" },
  bubbleTextMe: { color: "#EAF6FF" },
  bubbleTextOther: { color: "rgba(234,246,255,0.9)" },
  inputBar: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(234,246,255,0.08)",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#EAF6FF",
    backgroundColor: "rgba(234,246,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(234,246,255,0.10)",
    fontWeight: "700",
    fontSize: 14,
  },
  sendBtn: {
    width: 56,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E3A8A",
  },
});
