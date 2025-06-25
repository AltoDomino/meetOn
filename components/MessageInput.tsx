import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from "react-native";

export default function MessageInput({ onSend }: { onSend: (msg: string) => void }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Napisz wiadomość..."
      />
      <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
        <Text style={styles.sendText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", padding: 8, backgroundColor: "#eee" },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, height: 40 },
  sendButton: { marginLeft: 8 },
  sendText: { fontSize: 20, fontWeight: "bold" },
});
