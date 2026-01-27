import { styles } from "@/styles//FriendList.styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
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

import ChatModal from "@/components/ChatModal";

type Friend = { id: number; userName: string };

type FriendRequest = {
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

// backend ma mieć te trasy
const removeFriendUrl = () => `${BACKEND_URL}/api/invite-friends/remove`;
const rejectInviteUrl = () => `${BACKEND_URL}/api/invite-friends/reject`; // recipient odrzuca (PENDING)
const cancelInviteUrl = () => `${BACKEND_URL}/api/invite-friends/cancel`; // requester anuluje (opcjonalnie)

/** ✅ deduplikacja po id (naprawia warning o key) */
const uniqByNumericId = <T extends { id: number }>(arr: T[]) => {
  const seen = new Set<number>();
  const out: T[] = [];
  for (const x of arr) {
    if (!Number.isFinite(x.id)) continue;
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    out.push(x);
  }
  return out;
};

/** ✅ deduplikacja zaproszeń po senderId */
const uniqBySenderId = (arr: FriendRequest[]) => {
  const seen = new Set<number>();
  const out: FriendRequest[] = [];
  for (const x of arr) {
    if (!Number.isFinite(x.senderId) || x.senderId <= 0) continue;
    if (seen.has(x.senderId)) continue;
    seen.add(x.senderId);
    out.push(x);
  }
  return out;
};

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

  const trimmedQuery = query.trim();
  const canInviteBase = trimmedQuery.length >= 3 && !sending;

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
        userName: String(x?.userName ?? x?.name ?? x?.login ?? "").trim(),
      }))
      .filter((x: Friend) => !!x.userName && Number.isFinite(x.id));
  };

  // backend: [{ requesterId, userName }]
  const normalizePending = (data: any): FriendRequest[] => {
    if (!Array.isArray(data)) return [];
    return data
      .map((x: any) => {
        const senderId = Number(x?.requesterId);
        const senderName = String(x?.userName ?? "").trim();
        if (!Number.isFinite(senderId) || senderId <= 0 || !senderName)
          return null;
        return { senderId, senderName } as FriendRequest;
      })
      .filter(Boolean) as FriendRequest[];
  };

  const alreadyFriend = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    return q && friends.some((f) => f.userName.toLowerCase() === q);
  }, [friends, trimmedQuery]);

  const hasIncomingRequestFromThatUser = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    return q && pending.some((p) => p.senderName.toLowerCase() === q);
  }, [pending, trimmedQuery]);

  const canInvite = canInviteBase && !alreadyFriend;

  const fetchFriends = async () => {
    if (!userId) return;
    try {
      setLoadingFriends(true);
      const res = await fetch(friendsUrl(userId));
      const data = await safeJson(res);

      // ✅ dedupe to avoid "same key" warnings
      setFriends(uniqByNumericId(normalizeFriends(data)));
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

      // ✅ dedupe
      setPending(uniqBySenderId(normalizePending(data)));
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

  const showBackendError = (data: any, status: number) => {
    const msg = String(data?.error ?? "").trim();
    if (msg) {
      Alert.alert("Info", msg);
      return;
    }
    Alert.alert("Błąd", `Nie udało się wykonać operacji (${status}).`);
  };

  const onInvite = async () => {
    if (!userId) return;
    if (!canInviteBase) return;

    if (alreadyFriend) {
      Alert.alert("Info", "Jesteście już znajomymi.");
      return;
    }
    if (hasIncomingRequestFromThatUser) {
      Alert.alert(
        "Info",
        "Masz już zaproszenie od tego użytkownika. Zaakceptuj je w 'Zaproszenia oczekujące'."
      );
      return;
    }

    try {
      setSending(true);

      const res = await fetch(sendInviteUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          receiverName: trimmedQuery,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        showBackendError(data, res.status);
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
        showBackendError(data, res.status);
        return;
      }

      await refreshAll();
      Alert.alert("Dodano", "Użytkownik został dodany do znajomych.");
    } catch (e) {
      console.error("Błąd akceptacji zaproszenia:", e);
      Alert.alert("Błąd", "Nie udało się zaakceptować zaproszenia.");
    }
  };

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
        showBackendError(data, res.status);
        return;
      }

      await fetchFriends();
    } catch {
      Alert.alert("Błąd", "Nie udało się usunąć znajomego.");
    }
  };

  // ✅ recipient odrzuca zaproszenie po senderId
  const onRejectInvite = async (senderId: number) => {
    if (!userId) return;
    try {
      const res = await fetch(rejectInviteUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, requesterId: senderId }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        showBackendError(data, res.status);
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
                tintColor="#1E3A8A"
                colors={["#1E3A8A"]}
              />
            }
          >
            <View style={styles.titleRow}>
              <Text style={styles.title}>ZNAJOMI</Text>
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
                      <Ionicons name="person-add-outline" size={16} color="#fff" />
                      <Text style={styles.inviteButtonText}>Zaproś</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {alreadyFriend ? (
                <Text style={styles.helper}>
                  Ten użytkownik jest już Twoim znajomym.
                </Text>
              ) : hasIncomingRequestFromThatUser ? (
                <Text style={styles.helper}>
                  Masz już zaproszenie od tego użytkownika — zaakceptuj je w
                  „ZAPROSZENIA OCZEKUJĄCE”.
                </Text>
              ) : (
                <Text style={styles.helper}>
                  Min. 3 znaki. Zaproszenie trafi do „ZAPROSZENIA OCZEKUJĄCE”.
                </Text>
              )}
            </View>

            <View style={[styles.columnsRow, { flexDirection: "column" }]}>
              {/* ✅ ZAPROSZENIA OCZEKUJĄCE — TERAZ NA GÓRZE */}
              <View style={styles.col}>
                <Text style={styles.colHeader}>ZAPROSZENIA OCZEKUJĄCE</Text>

                <View style={styles.listCard}>
                  {loadingPending ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#1E3A8A" />
                      <Text style={styles.loadingText}>Ładowanie…</Text>
                    </View>
                  ) : pending.length === 0 ? (
                    <Text style={styles.empty}>Brak zaproszeń.</Text>
                  ) : (
                    pending.map((p) => (
                      <View key={`p:${p.senderId}`} style={styles.item}>
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
                              { backgroundColor: "#007AFF", borderColor: "#007AFF" },
                            ]}
                          >
                            <Text style={[styles.smallBtnText, { color: "#fff" }]}>
                              Akceptuj
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => onRejectInvite(p.senderId)}
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

              {/* ✅ MOI ZNAJOMI — TERAZ POD ZAPROSZENIAMI */}
              <View style={styles.col}>
                <Text style={styles.colHeader}>MOI ZNAJOMI</Text>

                <View style={styles.listCard}>
                  {loadingFriends ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#1E3A8A" />
                      <Text style={styles.loadingText}>Ładowanie…</Text>
                    </View>
                  ) : friends.length === 0 ? (
                    <Text style={styles.empty}>Brak znajomych.</Text>
                  ) : (
                    friends.map((f) => (
                      <View key={`f:${f.id}`} style={styles.item}>
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

                        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
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
            </View>
          </ScrollView>

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
