import BottomButton from "@/components/Bottombutton";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/Pofile.styles";

export default function ProfileScreen() {
  const {
    userId,
    userName,
    avatar,
    description,
    setAvatar,
    setUserName,
    setDescription,
  } = useAuth();

  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
      base64: false,
    });

    if (!result.canceled) {
      const image = result.assets[0];

      const formData = new FormData();
      formData.append("avatar", {
        uri: image.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("userId", userId?.toString() || "");

      try {
        const response = await fetch(
          "https://meeton-backend-ffmo.onrender.com/api/avatar",
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setAvatar(data.avatarUrl);
          Alert.alert("Sukces", "Avatar zapisany!");
        } else {
          Alert.alert("Błąd", data.error || "Coś poszło nie tak.");
        }
      } catch (error) {
        console.error("❌ Błąd przesyłania avatara:", error);
        Alert.alert("Błąd", "Nie udało się wysłać avatara.");
      }
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        "https://meeton-backend-ffmo.onrender.com/api/user/profile",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, userName, description }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUserName(data.userName);
        setDescription(data.description);
        Alert.alert("✅ Zmiany zapisane!");
      } else {
        Alert.alert("❌ Błąd", data.error || "Nie udało się zapisać zmian.");
      }
    } catch (err) {
      console.error("❌ Błąd zapisu profilu:", err);
      Alert.alert("❌ Błąd połączenia", "Spróbuj ponownie później.");
    }
  };

  const handleSubscription = () => {
    Alert.alert("Subskrypcja", "Zakup subskrypcji zakończony sukcesem!");
    setSubscriptionActive(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage} style={{ alignItems: "center" }}>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              marginBottom: 12,
            }}
          />
        ) : (
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "#ddd",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={styles.avatarHint}>Zmień avatar</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Login</Text>
      <TextInput
        value={userName}
        onChangeText={setUserName}
        style={styles.input}
      />

      <Text style={styles.label}>Opis</Text>
      <TextInput
        value={description}
        onChangeText={(text) => {
          if (text.length <= 30) setDescription(text);
        }}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <BottomButton onPress={handleSave} title="Zapisz zmiany" />

      {/* 
      <View style={styles.subscriptionSection}>
        <Text style={styles.label}>Subskrypcja</Text>
        <Text style={{ marginBottom: 10 }}>
          {subscriptionActive
            ? "✅ Masz aktywną subskrypcję"
            : "🔒 Brak subskrypcji"}
        </Text>
        {!subscriptionActive && (
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscription}
          >
            <Text style={styles.subscribeButtonText}>Wykup subskrypcję</Text>
          </TouchableOpacity>
        )}
      </View>
      */}
    </ScrollView>
  );
}
