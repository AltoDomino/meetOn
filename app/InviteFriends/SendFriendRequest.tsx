import React, { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function SendFriendRequest({ onRequestSent }: { onRequestSent?: () => void }) {
  const { userId } = useAuth();
  const [receiverName, setReceiverName] = useState("");

  const handleSendRequest = async () => {
    if (!receiverName || !userId) return;

    try {
      const res = await fetch(`http://192.168.1.26:3000/api/invite-friends/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          receiverName,
        }),
      });

      if (res.ok) {
        Alert.alert("✅ Zaproszenie wysłane!");
        setReceiverName("");

        if (onRequestSent) {
          setTimeout(() => onRequestSent(), 1000);
        }
      } else {
        const error = await res.json();
        Alert.alert("❌ Błąd", error?.error || "Nie udało się wysłać.");
      }
    } catch (error) {
      Alert.alert("Błąd połączenia");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Login znajomego"
        value={receiverName}
        onChangeText={setReceiverName}
        style={styles.input}
      />
      <Button title="Wyślij zaproszenie" onPress={handleSendRequest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});
