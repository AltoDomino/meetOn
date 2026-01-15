import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { UserRankTracker } from "@/components/PlayerStatus/UserRankTracker";
import { fetchMyRatingStats } from "@/hooks/userRatings";
import { useFocusEffect } from "expo-router";

const API_BASE = "https://meeton-backend-ffmo.onrender.com";

const THEME = {
  bg: "#6e8ac2",
  card: "#1E2F5C",
  primary: "#00A9F4",
  text: "#FFFFFF",
  muted: "#9FB4D1",
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      backgroundColor: THEME.card,
      borderRadius: 20,
      padding: 14,
      marginBottom: 14,
    }}
  >
    {children}
  </View>
);

export default function ProfileScreen() {
  const {
    userId,
    userName,
    avatar,
    description,
    setAvatar,
    setDescription,
  } = useAuth();

  const insets = useSafeAreaInsets();

  const [rankLoading, setRankLoading] = useState(true);
  const [completedEvents, setCompletedEvents] = useState(0);
  const [uniqueLocations, setUniqueLocations] = useState(0);

  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [avgStars, setAvgStars] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/users/${userId}/rank`)
      .then((r) => r.json())
      .then((d) => {
        setCompletedEvents(d.completedEvents || 0);
        setUniqueLocations(d.uniqueLocations || 0);
      })
      .finally(() => setRankLoading(false));
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      (async () => {
        try {
          const data = await fetchMyRatingStats({ baseUrl: API_BASE, userId });
          if (!active) return;
          setAvgStars(Number(data?.stars?.average ?? 0));
          setTotalRatings(Number(data?.stars?.count ?? 0));
        } catch {}
        setRatingsLoading(false);
      })();

      return () => {
        active = false;
      };
    }, [userId])
  );

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!res.canceled) {
      const img = res.assets[0];
      const form = new FormData();
      form.append("avatar", {
        uri: img.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);
      form.append("userId", String(userId));

      const r = await fetch(`${API_BASE}/api/avatar`, {
        method: "POST",
        body: form,
      });

      const d = await r.json();
      if (r.ok) setAvatar(d.avatarUrl);
    }
  };

  const handleSave = async () => {
    const r = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, description }),
    });

    if (r.ok) Alert.alert("Zapisano");
    else Alert.alert("Błąd");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flex: 1,
            padding: 16,
            paddingBottom: 16 + insets.bottom, // 🔥 ANDROID NAV BAR FIX
          }}
        >
          <Card>
            <TouchableOpacity
              onPress={pickImage}
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#2F4C7A",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                  />
                ) : (
                  <Text style={{ color: "#fff" }}>AV</Text>
                )}
              </View>
              <View>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
                  {userName}
                </Text>
                <Text style={{ color: THEME.muted }}>
                  Kliknij avatar aby zmienić
                </Text>
              </View>
            </TouchableOpacity>
          </Card>

          <Card>
            <Text style={{ color: THEME.text, fontWeight: "800" }}>
              Ocena społeczności
            </Text>
            {ratingsLoading ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ fontSize: 28, color: "#fff", fontWeight: "900" }}>
                {avgStars.toFixed(1)} ⭐ ({totalRatings})
              </Text>
            )}
          </Card>

          <Card>
            <Text style={{ color: THEME.text, fontWeight: "800", marginBottom: 8 }}>
              Ranga
            </Text>

            {rankLoading ? (
              <ActivityIndicator />
            ) : (
              <View
                style={{
                  height: 110,
                  overflow: "hidden",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    transform: [{ scale: 0.55 }],
                    width: "180%",
                    alignSelf: "center",
                  }}
                >
                  <UserRankTracker
                    userId={userId!}
                    initialCompletedEvents={completedEvents}
                    initialUniqueLocations={uniqueLocations}
                    apiBaseUrl={API_BASE}
                    onRankChange={() => {}}
                    onCompletedIncrement={() => {}}
                  />
                </View>
              </View>
            )}
          </Card>

          <Card>
            <Text style={{ color: THEME.text, fontWeight: "800" }}>
              Opis (max 100)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              maxLength={100}
              multiline
              style={{
                backgroundColor: "#2F4C7A",
                borderRadius: 12,
                padding: 12,
                color: "#fff",
                marginTop: 8,
                height: 80,
              }}
            />
          </Card>

          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: THEME.primary,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",

            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>
              Zapisz zmiany
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
