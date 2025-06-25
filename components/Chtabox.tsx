import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet } from "react-native";

export default function ChatBox() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, input]);
      setInput("");
    }
  };

  return (
    <View style={chatStyles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={chatStyles.message}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <View style={chatStyles.inputRow}>
        <TextInput
          style={chatStyles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Napisz wiadomość"
        />
        <Button title=">" onPress={handleSend} />
      </View>
    </View>
  );
}

const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  message: {
    paddingVertical: 4,
    fontSize: 14,
  },
});
