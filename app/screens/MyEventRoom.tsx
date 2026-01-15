import ChatBox, { Message } from "@/components/ChatBox";
import ParticipantDetailsModal from "@/components/ParticipantDetailsModal";
import RateParticipantsModal from "@/components/RateParticipants";
import { useEndEventListener } from "@/hooks/useEndEventListener";
import { useEventRatings } from "@/hooks/useEventRatings";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/MyEventRoom.styles";
import type { Event } from "./MyEvents";

const socket = io("https://meeton-backend-ffmo.onrender.com", {
  transports: ["websocket"],
});

type Participant = {
  id: number;
  userName: string;
  avatar: string | null;
  description?: string;
  age?: number;
};

const EventRoomScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { location, startDate, endDate, eventId } = useLocalSearchParams();
  const { userId, userName } = useAuth();

  const currentEventId =
    typeof eventId === "string"
      ? eventId
      : Array.isArray(eventId)
      ? eventId[0]
      : undefined;

  const {
    getUserRating,
    getUserTags,
    refetch: refetchRatings,
  } = useEventRatings(currentEventId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<{
    avg: number;
    count: number;
  } | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { showRatingModal, setShowRatingModal } = useEndEventListener({
    socket,
    currentEventId,
  });

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(
        `https://meeton-backend-ffmo.onrender.com/api/event/${
          currentEventId ?? eventId
        }/details`
      );
      const data = await res.json();
      setCurrentEvent(data);
      setParticipants(data.participants ?? []);
    } catch (err) {
      console.error("Błąd pobierania szczegółów wydarzenia:", err);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showRatingModal) {
      fetchEventDetails();
      refetchRatings();
    }
  }, [showRatingModal, refetchRatings]);

  useEffect(() => {
    if (!currentEventId) return;

    socket.emit("joinRoom", currentEventId);

    const onMessage = (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("message", onMessage);
    socket.on("participantJoined", fetchEventDetails);
    socket.on("participantLeft", fetchEventDetails);

    return () => {
      socket.emit("leaveRoom", currentEventId);
      socket.off("message", onMessage);
      socket.off("participantJoined", fetchEventDetails);
      socket.off("participantLeft", fetchEventDetails);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEventId]);

  const handleSendMessage = (content: string) => {
    if (!currentEventId || !userName) return;

    socket.emit("sendMessage", {
      eventId: currentEventId,
      content,
      sender: userName,
    });
  };

  const canDeleteEvent =
    currentEvent &&
    currentEvent.creator?.userName === userName &&
    participants.length === 0;

  const handleDeleteEvent = () => {
    Alert.alert(
      "Usuń wydarzenie",
      "Czy na pewno chcesz usunąć to wydarzenie? Tej operacji nie można cofnąć.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            if (!currentEvent) return;

            try {
              const res = await fetch(
                `https://meeton-backend-ffmo.onrender.com/api/event/${currentEvent.id}`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId }),
                }
              );

              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                  errorData.error || "Błąd podczas usuwania wydarzenia"
                );
              }

              Alert.alert("Wydarzenie zostało usunięte");
              router.push("/screens/MyEvents");
            } catch (error: unknown) {
              Alert.alert(
                "Błąd",
                error instanceof Error ? error.message : "Nieznany błąd"
              );
            }
          },
        },
      ]
    );
  };

  // ✅ pobieranie tagów/ocen po userId
  const fetchUserRatingsAndTags = async (targetUserId: number) => {
    const urls = [
      `https://meeton-backend-ffmo.onrender.com/api/user/${targetUserId}/ratings`,
      `https://meeton-backend-ffmo.onrender.com/api/users/${targetUserId}/ratings`,
      `https://meeton-backend-ffmo.onrender.com/api/ratings/user/${targetUserId}`,
      `https://meeton-backend-ffmo.onrender.com/api/rating/user/${targetUserId}`,
      `https://meeton-backend-ffmo.onrender.com/api/user/profile/${targetUserId}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();

        const tagsRaw =
          data?.tags ??
          data?.user?.tags ??
          data?.data?.tags ??
          data?.users?.[0]?.tags ??
          [];
        const tags = Array.isArray(tagsRaw)
          ? tagsRaw
              .map((t: any) =>
                typeof t === "string" ? t : t?.tag ?? t?.name ?? t?.label
              )
              .filter(Boolean)
          : [];

        const avg = Number(
          data?.avg ??
            data?.avgRating ??
            data?.ratingAvg ??
            data?.stars?.avg ??
            data?.stars?.average
        );
        const count = Number(
          data?.count ??
            data?.ratingsCount ??
            data?.stars?.count ??
            data?.stars?.total
        );

        return {
          rating: Number.isFinite(avg)
            ? { avg, count: Number.isFinite(count) ? count : 0 }
            : null,
          tags,
        };
      } catch {
        // ignore
      }
    }

    return { rating: null, tags: [] as string[] };
  };

  const openUserDetailsModal = async (targetUserId: number) => {
    try {
      const res = await fetch(
        `https://meeton-backend-ffmo.onrender.com/api/user/profile/${targetUserId}`
      );
      const profile = await res.json();

      const extra = await fetchUserRatingsAndTags(targetUserId);

      setSelectedParticipant(profile);
      setSelectedUserId(targetUserId);

      setSelectedRating(extra.rating ?? getUserRating(targetUserId));
      setSelectedTags(
        extra.tags?.length ? extra.tags : getUserTags(targetUserId)
      );

      setDetailsModalVisible(true);
    } catch (err) {
      console.error("Błąd pobierania danych użytkownika:", err);
    }
  };

  // creatorId do oceniania (z event details)
  const creatorForRating = useMemo(() => {
    const creator = (currentEvent as any)?.creator;
    const creatorName = creator?.userName;

    const candidates = [
      (currentEvent as any)?.creatorId,
      (currentEvent as any)?.ownerId,
      (currentEvent as any)?.hostId,
      (currentEvent as any)?.createdById,
      creator?.id,
    ];

    let creatorId: number | null = null;
    for (const c of candidates) {
      const n = Number(c);
      if (!Number.isNaN(n) && n > 0) {
        creatorId = n;
        break;
      }
    }

    if (!creatorId && creatorName) {
      const found = (participants || []).find(
        (p: any) => String(p?.userName ?? "") === String(creatorName)
      );
      const n = Number(found?.id);
      if (!Number.isNaN(n) && n > 0) creatorId = n;
    }

    if (!creatorId) return null;

    return {
      id: creatorId,
      userName: creatorName ?? "Twórca",
      avatar: creator?.avatar ?? null,
      age: creator?.age ?? null,
    };
  }, [currentEvent, participants]);

  const participantsForRating = useMemo(() => {
    const list: any[] = (participants || []).map((p: any) => ({
      id: Number(p.id),
      userName: p.userName,
      avatar: p.avatar ?? null,
      age: typeof p.age === "number" ? p.age : null,
    }));

    if (creatorForRating?.id) list.push(creatorForRating);

    const map = new Map<number, any>();
    for (const p of list) if (p?.id) map.set(p.id, p);

    return Array.from(map.values());
  }, [participants, creatorForRating]);

  return (
    <>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          paddingBottom: Platform.OS === "android" ? insets.bottom + 20 : 0,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 80 : 0}
      >
        <View style={styles.container}>
          <Stack.Screen
            options={{
              title: "MOJE WYDARZENIA",
              headerStyle: { backgroundColor: "#3A8FB7" },
              headerTintColor: "#fff",
              headerTitleAlign: "center",
            }}
          />

          <View style={styles.header}>
            <View style={styles.eventInfo}>
              <Text style={styles.title}>{location}</Text>
              <Text>
                {new Date(
                  Array.isArray(startDate) ? startDate[0] : startDate
                ).toLocaleString()}{" "}
                -{" "}
                {new Date(
                  Array.isArray(endDate) ? endDate[0] : endDate
                ).toLocaleTimeString()}
              </Text>
            </View>

            {canDeleteEvent && (
              <TouchableOpacity
                style={styles.leaveButtonWrapper}
                onPress={handleDeleteEvent}
              >
                <View style={styles.leaveTextWrapper}>
                  <Text style={styles.leaveButton}>Usuń</Text>
                  <Text style={styles.leaveButton}>wydarzenie</Text>
                </View>
                <Ionicons
                  name="exit-outline"
                  size={18}
                  color="#999"
                  style={styles.leaveIcon}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* uczestnicy + przycisk OCENY */}
          <View style={styles.participantsContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.participantsTitle}>
                  {isExpanded ? "Ukryj uczestników ▲" : "Pokaż uczestników ▼"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowRatingModal(true)}
                style={{
                  backgroundColor: "#517fc5ff",
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}
                >
                  Oceny
                </Text>
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <FlatList
                data={participants}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Brak uczestników</Text>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => openUserDetailsModal(item.id)}
                    style={styles.participantCard}
                  >
                    <View style={styles.avatar}>
                      {item.avatar && item.avatar.trim() !== "" ? (
                        <Image
                          source={{ uri: item.avatar }}
                          style={{ width: 40, height: 40, borderRadius: 20 }}
                        />
                      ) : (
                        <Text style={styles.avatarText}>
                          {item.userName?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>

                    <View style={{ flexDirection: "column", marginLeft: 10 }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={styles.userName}>{item.userName}</Text>
                        {item.id === userId && (
                          <Text
                            style={{
                              marginLeft: 6,
                              fontSize: 12,
                              color: "#3A8FB7",
                            }}
                          >
                            👤
                          </Text>
                        )}
                      </View>

                      {item.age && (
                        <Text style={{ color: "#777", fontSize: 12 }}>
                          Wiek: {item.age}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          <View
            style={[
              styles.chatContainer,
              { flex: 1, justifyContent: "flex-end" },
            ]}
          >
            <ChatBox messages={messages} onSend={handleSendMessage} />
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ✅ MODAL PROFILU (opis + oceny + tagi) */}
      <ParticipantDetailsModal
        visible={detailsModalVisible}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedParticipant(null);
          setSelectedUserId(null);
          setSelectedRating(null);
          setSelectedTags([]);
        }}
        participant={selectedParticipant}
        rating={selectedRating}
        tags={selectedTags} // ✅ teraz to [{tag,count}]
      />

      {/* ✅ MODAL OCEN */}
      <RateParticipantsModal
        visible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          refetchRatings();
        }}
        eventId={currentEventId ?? ""}
        participants={participantsForRating}
        excludeUserId={typeof userId === "number" ? userId : undefined}
        eventTitle={typeof location === "string" ? location : "Wydarzenie"}
      />
    </>
  );
};

export default EventRoomScreen;
