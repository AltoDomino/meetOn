import { UserRankTracker } from "@/components/PlayerStatus/UserRankTracker";
import { fetchMyRatingStats } from "@/hooks/userRatings";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import { Image as ExpoImage } from "expo-image";
import { useAuth } from "../../context/AuthContext";
import { profileStyles as styles } from "../../styles/Profile.styles";

const API_BASE = "https://meeton-backend-ffmo.onrender.com";

// Prosty blurhash placeholder (może zostać taki sam wszędzie)
const AVATAR_BLURHASH = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";

export default function ProfileScreen() {
  const router = useRouter();

  // bierzemy co jest pewne + opcjonalnie logout (bez crasha jeśli nie istnieje)
  const auth = useAuth() as any;
  const { userId, userName, avatar, description, setAvatar, setDescription } =
    auth;
  const logout = auth?.logout || auth?.signOut || auth?.handleLogout;

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

  // Avatar: stabilne ładowanie + fallback
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // ===== Delete account =====
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = useMemo(() => {
    const n = (userName || "U").trim();
    return n.charAt(0).toUpperCase();
  }, [userName]);

  // Reset błędu avatara gdy zmieni się URL
  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

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
    }, [userId])
  );

const pickImage = async () => {
  // 🔁 compat: działa na starym i nowym expo-image-picker
  const mediaTypesCompat =
    // @ts-ignore – MediaType istnieje tylko w nowszych wersjach
    ImagePicker.MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: mediaTypesCompat,
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
    setAvatarLoading(true);

    const response = await fetch(`${API_BASE}/api/avatar`, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = await response.json();

    if (response.ok) {
      const url = String(data.avatarUrl || "");
      const busted = url
        ? `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`
        : "";

      setAvatar(busted);
      setAvatarError(false);

      Alert.alert("Sukces", "Avatar zapisany!");
    } else {
      Alert.alert("Błąd", data.error || "Coś poszło nie tak.");
    }
  } catch (error) {
    Alert.alert("Błąd", "Nie udało się wysłać avatara.");
  } finally {
    setAvatarLoading(false);
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

  const handleDeleteAccount = async () => {
    console.log("🗑️ handleDeleteAccount start");
    console.log("➡️ userId:", userId);
    console.log("➡️ deleting:", deleting);

    if (!userId) {
      console.warn("⛔ Brak userId – abort");
      return;
    }
    if (deleting) {
      console.warn("⛔ deleting=true – abort");
      return;
    }

    try {
      setDeleting(true);

      const token =
        auth?.token ||
        auth?.accessToken ||
        auth?.jwt ||
        auth?.sessionToken ||
        auth?.user?.token;

      console.log("🔐 token exists:", !!token);
      if (token) {
        console.log("🔐 token preview:", String(token).slice(0, 20) + "...");
      }

      const url = `${API_BASE}/api/delete-account/account/${userId}`;
      console.log("📡 DELETE:", url);

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      console.log("📨 status:", res.status);

      const raw = await res.text();
      console.log("📦 raw body:", raw);

      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.warn("⚠️ JSON parse fail:", e);
      }

      if (!res.ok) {
        console.error("❌ delete failed:", res.status, data);
        Alert.alert("Błąd", data?.error || data?.message || `HTTP ${res.status}`);
        return;
      }

      console.log("✅ delete success:", data);

      setDeleteModalVisible(false);

      try {
        console.log("🚪 logout...");
        await logout?.();
        console.log("✅ logout ok");
      } catch (e) {
        console.warn("⚠️ logout failed:", e);
      }

      console.log("➡️ redirect to login");
      router.replace("/(main)/Login");
      Alert.alert("Konto usunięte", "Twoje konto zostało trwale usunięte.");
    } catch (e) {
      console.error("❌ Delete exception:", e);
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem.");
    } finally {
      setDeleting(false);
      console.log("🏁 deleting=false");
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
              { paddingBottom: Math.max(insets.bottom, 12) + 100 },
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
                  {avatar && !avatarError ? (
                    <View style={{ width: "100%", height: "100%" }}>
                      {/* ✅ expo-image: lepszy cache + stabilniejsze ładowanie */}
                      <ExpoImage
                        source={{ uri: avatar }}
                        style={styles.avatarImg}
                        cachePolicy="disk"
                        placeholder={{ blurhash: AVATAR_BLURHASH }}
                        transition={180}
                        onLoadStart={() => setAvatarLoading(true)}
                        onLoadEnd={() => setAvatarLoading(false)}
                        onError={() => {
                          setAvatarLoading(false);
                          setAvatarError(true);
                        }}
                      />

                      {/* loader na wierzchu avatara */}
                      {avatarLoading ? (
                        <View
                          style={{
                            position: "absolute",
                            inset: 0,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ActivityIndicator color="#1E3A8A" />
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={styles.avatarFallbackText}>{initials}</Text>
                    </View>
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
                    <Text style={styles.ratingValue}>{avgStars.toFixed(1)}</Text>
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

            {/* Usuń konto (mały czerwony) */}
            <View>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(true)}
                style={local.deleteButton}
              >
                <Text style={local.deleteButtonText}>Usuń konto</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>

      {/* Modal potwierdzenia */}
      <Modal
        transparent
        animationType="fade"
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable
          style={local.modalOverlay}
          onPress={() => setDeleteModalVisible(false)}
        >
          <Pressable style={local.modalCard} onPress={() => {}}>
            <Text style={local.modalTitle}>
              Czy na pewno chcesz trwale usunąć konto?
            </Text>
            <Text style={local.modalDesc}>Tej operacji nie da się cofnąć.</Text>

            <View style={local.modalActions}>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                activeOpacity={0.85}
                style={local.modalBtn}
                disabled={deleting}
              >
                <Text style={local.modalBtnText}>Anuluj</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                activeOpacity={0.85}
                style={[local.modalBtnDanger, deleting && { opacity: 0.7 }]}
                disabled={deleting}
              >
                <Text style={local.modalBtnDangerText}>
                  {deleting ? "Usuwanie..." : "Usuń trwale"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const local = {
  deleteBar: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  deleteButton: {
    alignSelf: "center" as const,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#b91c1c",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900" as const,
    letterSpacing: 0.4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center" as const,
    padding: 18,
  },
  modalCard: {
    backgroundColor: "rgba(10,18,35,0.98)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900" as const,
    marginBottom: 8,
  },
  modalDesc: {
    color: "rgba(234,246,255,0.70)",
    fontSize: 13,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: "row" as const,
    gap: 10,
    justifyContent: "flex-end" as const,
  },
  modalBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "800" as const,
    fontSize: 13,
  },
  modalBtnDanger: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#b91c1c",
  },
  modalBtnDangerText: {
    color: "#fff",
    fontWeight: "900" as const,
    fontSize: 13,
  },
};
