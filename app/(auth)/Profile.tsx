import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../styles/Pofile.styles";
export default function ProfileScreen() {
  const [login, setLogin] = useState("użytkownik123");
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const pickImage = async () => {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });


  };

  const handleSubscription = () => {
    Alert.alert("Subskrypcja", "Zakup subskrypcji zakończony sukcesem!");
    setSubscriptionActive(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage}>
{/* <Image source={{ uri: avatarUri }} style={{ width: 100, height: 100 }} /> */}
        <Text style={styles.avatarHint}>Zmień avatar</Text>
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

      <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert("Zapisano zmiany!")}>
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
