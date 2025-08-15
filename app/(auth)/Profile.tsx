import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/Pofile.styles";
import { UserRankTracker } from "@/components/PlayerStatus/UserRankTracker";

const API_BASE = "https://meeton-backend-ffmo.onrender.com";

const SaveButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: "#00A9F4",
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.12,
      shadowRadius: 6,
      elevation: 3,
      marginTop: 10, // ⬅️ przesunięcie przycisku w dół o 10 px
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
      Zapisz zmiany
    </Text>
  </TouchableOpacity>
);

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

  const [rankLoading, setRankLoading] = useState(true);
  const [completedEvents, setCompletedEvents] = useState(0);
  const [uniqueLocations, setUniqueLocations] = useState(0);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!userId) return setRankLoading(false);
      try {
        const res = await fetch(`${API_BASE}/api/users/${userId}/rank`);
        if (!isMounted) return;
        const data = res.ok ? await res.json() : {};
        setCompletedEvents(Number(data?.completedEvents ?? 0));
        setUniqueLocations(Number(data?.uniqueLocations ?? 0));
      } catch (e) {
        console.warn("Rank stats fetch error:", (e as Error).message);
      } finally {
        if (isMounted) setRankLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [userId]);

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
        const response = await fetch(`${API_BASE}/api/avatar`, {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });
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
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName, description }),
      });
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#c5def3ff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator
          contentInsetAdjustmentBehavior="automatic"
        >
          {/* AVATAR */}
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            style={{ alignSelf: "center", marginBottom: 16 }}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  borderWidth: 0,
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
                }}
              >
                <Text style={styles.avatarHint}>Zmień avatar</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* RANGA */}
          <View style={{ width: "100%", marginTop: 4, marginBottom: 12 }}>
            {rankLoading ? (
              <View
                style={{
                  marginHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E8E8E8",
                  backgroundColor: "#FFF",
                  paddingVertical: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <ActivityIndicator />
                <Text style={{ color: "#666" }}>Ładowanie rangi...</Text>
              </View>
            ) : (
              <UserRankTracker
                userId={userId!}
                initialCompletedEvents={completedEvents}
                initialUniqueLocations={uniqueLocations}
                apiBaseUrl={API_BASE}
                onRankChange={() => {}}
                onCompletedIncrement={() => {}}
              />
            )}
          </View>

          {/* FORM */}
          <Text style={styles.label}>Nazwa użytkownika</Text>
          <TextInput value={userName} onChangeText={setUserName} style={styles.input} />

          <Text style={styles.label}>Opis</Text>
          <TextInput
            value={description}
            onChangeText={(text) => {
              if (text.length <= 100) setDescription(text);
            }}
            style={[styles.input, { height: 80 }]}
            multiline
            maxLength={100}
          />
          <SaveButton onPress={handleSave} />

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
