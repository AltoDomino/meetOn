import { UserRankTracker } from "@/components/PlayerStatus/UserRankTracker";
import { fetchMyRatingStats } from "@/hooks/userRatings";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { profileStyles as styles } from "../../styles/Profile.styles";

const API_BASE = "https://meeton-backend-ffmo.onrender.com";

export default function ProfileScreen() {
  const { userId, userName, avatar, description, setAvatar, setDescription } =
    useAuth();
  const insets = useSafeAreaInsets();

  const [saving, setSaving] = useState(false);

  const [rankLoading, setRankLoading] = useState(true);
  const [completedEvents, setCompletedEvents] = useState(0);
  const [uniqueLocations, setUniqueLocations] = useState(0);

  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [avgStars, setAvgStars] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [tagsSummary, setTagsSummary] = useState<
    { tag: string; count: number }[]
  >([]);

  const initials = useMemo(() => {
    const n = (userName || "U").trim();
    return n.charAt(0).toUpperCase();
  }, [userName]);

  // ===== Rank =====
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

  // ===== Ratings (refresh on focus) =====
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      (async () => {
        if (!userId) return setRatingsLoading(false);

        try {
          setRatingsLoading(true);
          const data = await fetchMyRatingStats({ baseUrl: API_BASE, userId });

          if (!isMounted) return;

          setAvgStars(Number(data?.stars?.average ?? 0));
          setTotalRatings(Number(data?.stars?.count ?? 0));
          setTagsSummary(Array.isArray(data?.tags) ? data.tags : []);
        } catch (e) {
          console.warn("User ratings-stats fetch error:", (e as Error).message);
        } finally {
          if (isMounted) setRatingsLoading(false);
        }
      })();

      return () => {
        isMounted = false;
      };
    }, [userId]),
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;

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
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, description }),
      });

      const data = await res.json();

      if (res.ok) {
        setDescription(data.description);
        Alert.alert("✅ Zmiany zapisane!");
      } else {
        Alert.alert("❌ Błąd", data.error || "Nie udało się zapisać zmian.");
      }
    } catch (err) {
      console.error("❌ Błąd zapisu profilu:", err);
      Alert.alert("❌ Błąd połączenia", "Spróbuj ponownie później.");
    } finally {
      setSaving(false);
    }
  };

  const descLen = description?.length ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Math.max(insets.bottom, 12) + 18 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>PROFIL</Text>

              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={saving}
                style={[
                  styles.headerButton,
                  saving && styles.headerButtonDisabled,
                ]}
              >
                <Ionicons name="save-outline" size={16} color="#fff" />
                <Text style={styles.headerButtonText}>
                  {saving ? "Zapis..." : "Zapisz"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Avatar + name */}
            <View style={styles.card}>
              <View style={styles.topRow}>
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.85}
                  style={styles.avatarWrap}
                >
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarFallbackText}>{initials}</Text>
                  )}
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userName || "Użytkownik"}
                  </Text>
                  <Text style={styles.helper}>Kliknij avatar, aby zmienić</Text>
                </View>
              </View>
            </View>

            {/* Ocena */}
            <View style={styles.card}>
              <View style={styles.ratingHeaderRow}>
                <Text style={styles.sectionTitle}>Ocena społeczności</Text>
                {!ratingsLoading && (
                  <Text style={styles.ratingCount}>{totalRatings} ocen</Text>
                )}
              </View>

              {ratingsLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#1E3A8A" />
                  <Text style={styles.muted}>Ładowanie…</Text>
                </View>
              ) : totalRatings === 0 ? (
                <Text style={styles.muted}>
                  Brak ocen. Zbieraj dobre wrażenia na wydarzeniach 🙂
                </Text>
              ) : (
                <>
                  <View style={styles.ratingValueRow}>
                    <Text style={styles.ratingValue}>
                      {avgStars.toFixed(1)}
                    </Text>
                    <Text
                      style={{
                        color: "#fbbf24",
                        fontSize: 18,
                        fontWeight: "900",
                      }}
                    >
                      ★
                    </Text>
                  </View>

                  {tagsSummary.length > 0 && (
                    <View style={styles.pillsRow}>
                      {tagsSummary.slice(0, 3).map((t) => (
                        <View key={t.tag} style={styles.pill}>
                          <Text style={styles.pillText}>
                            {t.tag} · {t.count}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Ranga */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Ranga</Text>

              {rankLoading ? (
                <ActivityIndicator color="#1E3A8A" />
              ) : (
                <View style={styles.rankBox}>
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
            </View>

            {/* Opis */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Opis</Text>

              <TextInput
                value={description}
                onChangeText={(t) => setDescription(t.slice(0, 70))}
                placeholder="Napisz krótko o sobie…"
                placeholderTextColor="rgba(234,246,255,0.45)"
                style={styles.input}
                multiline
                maxLength={70}
              />

              <Text style={styles.counter}>{descLen}/70</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </SafeAreaView>
  );
}
