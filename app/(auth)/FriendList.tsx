import { styles } from "@/styles//FriendList.styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

// ✅ DODAJ TEN IMPORT (dopasuj ścieżkę do swojego projektu)
import ChatModal from "@/components/ChatModal";

type Friend = { id: number; userName: string };

type FriendRequest = {
  id: string;
  senderId: number; // requesterId
  senderName: string; // userName
};

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

const friendsUrl = (userId: number) =>
  `${BACKEND_URL}/api/invite-friends/${userId}`;
const pendingUrl = (userId: number) =>
  `${BACKEND_URL}/api/invite-friends/requests/${userId}`;
const sendInviteUrl = () => `${BACKEND_URL}/api/invite-friends/send`;
const acceptInviteUrl = () => `${BACKEND_URL}/api/invite-friends/accept`;

// ⚠️ tych tras NIE MA w Twoim routerze (dopóki nie dodasz w backendzie)
const removeFriendUrl = () => `${BACKEND_URL}/api/invite-friends/remove`;
const cancelInviteUrl = () => `${BACKEND_URL}/api/invite-friends/cancel`;

export default function InviteFriendsScreen() {
  const insets = useSafeAreaInsets();
  useWindowDimensions();
  const { userId } = useAuth();

  const [query, setQuery] = useState("");

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<FriendRequest[]>([]);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ CHAT STATE
  const [chatVisible, setChatVisible] = useState(false);
  const [chatFriend, setChatFriend] = useState<Friend | null>(null);

  const openChat = (friend: Friend) => {
    setChatFriend(friend);
    setChatVisible(true);
  };

  const closeChat = () => {
    setChatVisible(false);
    setChatFriend(null);
  };

  const canInvite = query.trim().length >= 3 && !sending;

  const initials = (name: string) => (name?.trim()?.[0] || "U").toUpperCase();

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const normalizeFriends = (data: any): Friend[] => {
    if (!Array.isArray(data)) return [];
    return data
      .map((x: any) => ({
        id: Number(x?.id),
        userName: String(x?.userName ?? x?.name ?? x?.login ?? ""),
      }))
      .filter((x: Friend) => !!x.userName && Number.isFinite(x.id));
  };

  const normalizePending = (data: any): FriendRequest[] => {
    if (!Array.isArray(data)) return [];

    const mapped = data
      .map((x: any, i: number) => {
        const senderId = Number(x?.requesterId);
        const senderName = String(x?.userName ?? "").trim();

        if (!Number.isFinite(senderId) || senderId <= 0 || !senderName)
          return null;

        return {
          id: `req:${senderId}:${senderName}:${i}`,
          senderId,
          senderName,
        } as FriendRequest;
      })
      .filter(Boolean) as FriendRequest[];

    const seen = new Set<number>();
    return mapped.filter((r) => {
      if (seen.has(r.senderId)) return false;
      seen.add(r.senderId);
      return true;
    });
  };

  const fetchFriends = async () => {
    if (!userId) return;
    try {
      setLoadingFriends(true);
      const res = await fetch(friendsUrl(userId));
      const data = await safeJson(res);
      setFriends(normalizeFriends(data));
    } catch (e) {
      console.error("Błąd pobierania znajomych:", e);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchPending = async () => {
    if (!userId) return;
    try {
      setLoadingPending(true);
      const res = await fetch(pendingUrl(userId));
      const data = await safeJson(res);
      setPending(normalizePending(data));
    } catch (e) {
      console.warn("Błąd pobierania zaproszeń:", e);
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchFriends(), fetchPending()]);
  };

  useEffect(() => {
    if (userId) refreshAll();
  }, [userId]);

  const onPullRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  };

  const onInvite = async () => {
    if (!userId) return;
    if (!canInvite) return;

    try {
      setSending(true);

      const res = await fetch(sendInviteUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          receiverName: query.trim(),
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        Alert.alert(
          "Błąd",
          data?.error || `Nie udało się wysłać zaproszenia (${res.status}).`
        );
        return;
      }

      setQuery("");
      await refreshAll();
      Alert.alert("Sukces", "Zaproszenie wysłane!");
    } catch (e) {
      console.error("Błąd wysyłania zaproszenia:", e);
      Alert.alert("Błąd", "Nie udało się wysłać zaproszenia.");
    } finally {
      setSending(false);
    }
  };

  const onAcceptInvite = async (senderId: number) => {
    if (!userId) return;

    try {
      const res = await fetch(acceptInviteUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          receiverId: userId,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        Alert.alert(
          "Błąd",
          data?.error || `Nie udało się zaakceptować (${res.status}).`
        );
        return;
      }

      await refreshAll();
      Alert.alert("Dodano", "Użytkownik został dodany do znajomych.");
    } catch (e) {
      console.error("Błąd akceptacji zaproszenia:", e);
      Alert.alert("Błąd", "Nie udało się zaakceptować zaproszenia.");
    }
  };

  // ⚠️ nadal nie zadziała bez tras w backendzie
  const onRemoveFriend = async (id: number) => {
    if (!userId) return;
    try {
      const res = await fetch(removeFriendUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, friendId: id }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        Alert.alert(
          "Błąd",
          data?.error || `Nie udało się usunąć znajomego (${res.status}).`
        );
        return;
      }

      await fetchFriends();
    } catch {
      Alert.alert("Błąd", "Nie udało się usunąć znajomego.");
    }
  };

  // ⚠️ nadal nie zadziała bez tras w backendzie
  const onCancelInvite = async (id: string) => {
    if (!userId) return;
    try {
      const res = await fetch(cancelInviteUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, inviteId: id }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        Alert.alert(
          "Błąd",
          data?.error || `Nie udało się odrzucić zaproszenia (${res.status}).`
        );
        return;
      }

      await fetchPending();
    } catch {
      Alert.alert("Błąd", "Nie udało się odrzucić zaproszenia.");
    }
  };

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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onPullRefresh}
                tintColor="#3A8FB7"
                colors={["#3A8FB7"]}
              />
            }
          >
            <View style={styles.titleRow}>
              <Text style={styles.title}>ZAPROŚ ZNAJOMYCH</Text>
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.sectionTitle}>Wpisz nazwę użytkownika</Text>

              <View style={styles.inputRow}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="np. mateusz_23"
                  placeholderTextColor="rgba(234,246,255,0.45)"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={onInvite}
                />

                <TouchableOpacity
                  onPress={onInvite}
                  activeOpacity={0.85}
                  disabled={!canInvite}
                  style={[
                    styles.inviteButton,
                    (!canInvite || sending) && styles.inviteButtonDisabled,
                  ]}
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="person-add-outline"
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.inviteButtonText}>Zaproś</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.helper}>
                Min. 3 znaki. Zaproszenie trafi do „ZAPROSZENIA OCZEKUJĄCE”.
              </Text>
            </View>

            <View style={[styles.columnsRow, { flexDirection: "column" }]}>
              {/* MOI ZNAJOMI */}
              <View style={styles.col}>
                <Text style={styles.colHeader}>MOI ZNAJOMI</Text>

                <View style={styles.listCard}>
                  {loadingFriends ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#3A8FB7" />
                      <Text style={styles.loadingText}>Ładowanie…</Text>
                    </View>
                  ) : friends.length === 0 ? (
                    <Text style={styles.empty}>Brak znajomych.</Text>
                  ) : (
                    friends.map((f, index) => (
                      <View key={`f:${f.id}:${index}`} style={styles.item}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {initials(f.userName)}
                          </Text>
                        </View>

                        <View style={styles.itemMain}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {f.userName}
                          </Text>
                          <Text style={styles.itemSub} numberOfLines={1}>
                            Znajomy
                          </Text>
                        </View>

                        {/* ✅ CHMURKA + USUŃ */}
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => openChat(f)}
                            activeOpacity={0.85}
                            style={[
                              styles.smallBtn,
                              {
                                width: 40,
                                paddingHorizontal: 0,
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            ]}
                          >
                            <Ionicons
                              name="chatbubble-ellipses-outline"
                              size={18}
                              color="#EAF6FF"
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => onRemoveFriend(f.id)}
                            activeOpacity={0.85}
                            style={styles.smallBtn}
                          >
                            <Text style={styles.smallBtnText}>Usuń</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* ZAPROSZENIA OCZEKUJĄCE */}
              <View style={styles.col}>
                <Text style={styles.colHeader}>ZAPROSZENIA OCZEKUJĄCE</Text>

                <View style={styles.listCard}>
                  {loadingPending ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#3A8FB7" />
                      <Text style={styles.loadingText}>Ładowanie…</Text>
                    </View>
                  ) : pending.length === 0 ? (
                    <Text style={styles.empty}>Brak zaproszeń.</Text>
                  ) : (
                    pending.map((p, index) => (
                      <View
                        key={p.id ?? `p:${p.senderId}:${index}`}
                        style={styles.item}
                      >
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {initials(p.senderName)}
                          </Text>
                        </View>

                        <View style={styles.itemMain}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {p.senderName}
                          </Text>
                          <Text style={styles.itemSub} numberOfLines={1}>
                            Zaproszenie do znajomych
                          </Text>
                        </View>

                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => onAcceptInvite(p.senderId)}
                            activeOpacity={0.85}
                            style={[
                              styles.smallBtn,
                              {
                                backgroundColor: "#007AFF",
                                borderColor: "#007AFF",
                              },
                            ]}
                          >
                            <Text
                              style={[styles.smallBtnText, { color: "#fff" }]}
                            >
                              Akceptuj
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => onCancelInvite(p.id)}
                            activeOpacity={0.85}
                            style={styles.smallBtn}
                          >
                            <Text style={styles.smallBtnText}>Odrzuć</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* ✅ MODAL CZATU */}
          <ChatModal
            visible={chatVisible}
            onClose={closeChat}
            friend={chatFriend}
            userId={userId}
          />
        </KeyboardAvoidingView>
      </Pressable>
    </SafeAreaView>
  );
}
