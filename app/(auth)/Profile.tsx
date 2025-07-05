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
import { useAuth } from "../../context/AuthContext"; // zakładam, że tu masz userId
import { styles } from "../../styles/Pofile.styles";

export default function ProfileScreen() {
  const { userId } = useAuth(); // używane do identyfikacji użytkownika
  const [login, setLogin] = useState("użytkownik123");
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
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
        const response = await fetch("http://192.168.1.26:3000/api/avatar", {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setAvatar(data.avatarUrl); // Zapisujemy pełny URL avatara
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
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: 8,
            }}
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#ddd",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={styles.avatarHint}>Zmień avatar</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Login</Text>
      <TextInput value={login} onChangeText={setLogin} style={styles.input} />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Nowe hasło</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => Alert.alert("Zapisano zmiany!")}
      >
        <Text style={styles.saveButtonText}>Zapisz zmiany</Text>
      </TouchableOpacity>

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
    </ScrollView>
  );
}
