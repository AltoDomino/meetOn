import { backend_URL } from "@/backendURL";
import { useAuth } from "@/context/AuthContext";
import { StarRating } from "components/StarRating";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Participant = {
  id: number;
  userName: string;
  avatar?: string | null;
  age?: number | null;
};

type RatingState = {
  stars: number;
  tags: string[];
};

const positiveTags = [
  "kontaktowny/a",
  "zabawny/a",
  "przyjacielski/a",
  "punktualny/a",
  "wygadany/a",
  "pomocny/a",
];

const negativeTags = [
  "mało kontaktowny/a",
  "mało zaangażowany/a",
  "spóźnialski/a",
  "konfliktowy/a",
  "niepunktualny/a",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  eventId: string | number;
  participants: any[];
  eventTitle?: string;
  excludeUserId?: number;
};

const RateParticipantsModal = ({
  visible,
  onClose,
  eventId,
  participants,
  eventTitle = "",
  excludeUserId,
}: Props) => {
  const { userId } = useAuth(); // ✅ token niepotrzebny przy wyłączonym middleware

  const eventIdStr = useMemo(() => String(eventId ?? ""), [eventId]);

  // ✅ Helper: wyciągnij id z różnych struktur
  const extractId = (p: any): number | null => {
    const candidates = [
      p?.id,
      p?.userId,
      p?.participantId,
      p?.user?.id,
      p?.user?.userId,
    ];
    for (const c of candidates) {
      const n = Number(c);
      if (!Number.isNaN(n) && n > 0) return n;
    }
    return null;
  };

  // ✅ Helper: userName z różnych struktur
  const extractUserName = (p: any): string => {
    return (
      p?.userName ??
      p?.username ??
      p?.name ??
      p?.user?.userName ??
      p?.user?.username ??
      p?.user?.name ??
      "Użytkownik"
    );
  };

  // ✅ Helper: avatar z różnych struktur
  const extractAvatar = (p: any): string | null => {
    return (p?.avatar ??
      p?.avatarUrl ??
      p?.user?.avatar ??
      p?.user?.avatarUrl ??
      null) as string | null;
  };

  const extractAge = (p: any): number | null => {
    const a = p?.age ?? p?.user?.age;
    return typeof a === "number" ? a : null;
  };

  // ✅ Normalizacja danych z pokoju -> (id, userName, avatar, age)
  const normalizedParticipants: Participant[] = useMemo(() => {
    return (participants || [])
      .map((p: any) => {
        const id = extractId(p);
        if (!id) return null;
        return {
          id,
          userName: extractUserName(p),
          avatar: extractAvatar(p),
          age: extractAge(p),
        } as Participant;
      })
      .filter(Boolean) as Participant[];
  }, [participants]);

  // ✅ tylko ci, których oceniamy (bez siebie)
  const rateableParticipants = useMemo(() => {
    const me = Number(excludeUserId ?? userId);
    return normalizedParticipants.filter((p) => p.id !== me);
  }, [normalizedParticipants, excludeUserId, userId]);

  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState<Record<number, RatingState>>({});

  // ✅ reset po zamknięciu
  useEffect(() => {
    if (!visible) {
      setSubmitting(false);
      setRatings({});
    }
  }, [visible]);

  // ✅ inicjalizacja ocen po otwarciu modala / zmianie listy
  useEffect(() => {
    if (!visible) return;

    setRatings((prev) => {
      const next: Record<number, RatingState> = {};
      rateableParticipants.forEach((p) => {
        next[p.id] = prev[p.id] ?? { stars: 0, tags: [] };
      });
      return next;
    });
  }, [visible, rateableParticipants]);

  const toggleTag = (userIdTarget: number, tag: string) => {
    setRatings((prev) => {
      const current = prev[userIdTarget] || { stars: 0, tags: [] };
      const tags = current.tags.includes(tag)
        ? current.tags.filter((t) => t !== tag)
        : [...current.tags, tag];
      return { ...prev, [userIdTarget]: { ...current, tags } };
    });
  };

  const handleStarChange = (userIdTarget: number, stars: number) => {
    setRatings((prev) => ({ ...prev, [userIdTarget]: { stars, tags: [] } }));
  };

  const handleSubmit = async () => {
    const eventIdNum = Number(eventIdStr);
    if (Number.isNaN(eventIdNum) || eventIdNum <= 0) {
      Alert.alert("Błąd", "Nieprawidłowe ID wydarzenia.");
      return;
    }

    const raterIdNum = Number(userId);
    if (Number.isNaN(raterIdNum) || raterIdNum <= 0) {
      Alert.alert(
        "Błąd",
        "Brak poprawnego userId (raterId). Zaloguj się ponownie."
      );
      return;
    }

    const payloadRatings = rateableParticipants
      .map((p) => ({
        rateeId: p.id,
        stars: ratings[p.id]?.stars || 0,
        tags: ratings[p.id]?.tags || [],
      }))
      .filter((r) => r.stars > 0);

    if (payloadRatings.length === 0) {
      Alert.alert("Brak ocen", "Oceń przynajmniej jedną osobę.");
      return;
    }

    const url = `${backend_URL}/api/events/${eventIdNum}/ratings?force=true`;

    try {
      setSubmitting(true);

      // ✅ TU JEST KLUCZ: wysyłamy raterId w body (bez Authorization)
      const body = { raterId: raterIdNum, ratings: payloadRatings };

      console.log("📤 URL:", url);
      console.log("📤 BODY:", JSON.stringify(body, null, 2));

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      console.log("📥 STATUS:", res.status);
      console.log("📥 RESPONSE:", text);

      if (!res.ok) {
        let errMsg = "Nie udało się zapisać ocen.";
        try {
          const asJson = JSON.parse(text);
          errMsg = asJson?.error || errMsg;
        } catch {}
        Alert.alert("Błąd", `${errMsg} (HTTP ${res.status})`);
        return;
      }

      Alert.alert("Dziękujemy!", "Twoje oceny zostały zapisane.");
      onClose();
    } catch (err) {
      console.log("❌ submit error:", err);
      Alert.alert("Błąd", "Wystąpił problem podczas zapisywania ocen.");
    } finally {
      setSubmitting(false);
    }
  };

  const shouldShowLoading =
    visible &&
    (participants == null ||
      (Array.isArray(participants) && participants.length === 0));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {
        if (!submitting) onClose();
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.65)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#0d1a4d",
            borderRadius: 16,
            padding: 16,
            maxHeight: "90%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
                Oceń uczestników
              </Text>

              {!!eventTitle && (
                <Text style={{ color: "#cfe8ff", fontSize: 13, marginTop: 2 }}>
                  {eventTitle}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!submitting) onClose();
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.12)",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Zamknij</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          {shouldShowLoading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#00A9F4" />
              <Text style={{ color: "#cfe8ff", marginTop: 12 }}>
                Ładowanie uczestników…
              </Text>
            </View>
          ) : rateableParticipants.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <Text style={{ color: "#cfe8ff", textAlign: "center" }}>
                Brak osób do oceny (jesteś sam w wydarzeniu lub dane nie mają
                poprawnych ID).
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={rateableParticipants}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 90 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const currentRating = ratings[item.id] || {
                    stars: 0,
                    tags: [],
                  };

                  const tagsToShow =
                    currentRating.stars === 5
                      ? positiveTags
                      : currentRating.stars > 0
                      ? negativeTags
                      : [];

                  return (
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: 12,
                        marginBottom: 12,
                        flexDirection: "row",
                        alignItems: "flex-start",
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          backgroundColor: "#1c2b5a",
                          overflow: "hidden",
                          marginRight: 12,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {item.avatar ? (
                          <Image
                            source={{ uri: item.avatar }}
                            style={{ width: 50, height: 50 }}
                          />
                        ) : (
                          <Text style={{ color: "#fff", fontSize: 18 }}>
                            {item.userName?.charAt(0)?.toUpperCase() || "?"}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 16,
                            fontWeight: "600",
                            marginBottom: 6,
                          }}
                        >
                          {item.userName}
                          {typeof item.age === "number"
                            ? `, ${item.age} lat`
                            : ""}
                        </Text>

                        <StarRating
                          value={currentRating.stars}
                          onChange={(v: number) => handleStarChange(item.id, v)}
                        />

                        {tagsToShow.length > 0 && (
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              marginTop: 8,
                            }}
                          >
                            {tagsToShow.map((tag) => {
                              const selected = currentRating.tags.includes(tag);

                              return (
                                <TouchableOpacity
                                  key={tag}
                                  onPress={() => toggleTag(item.id, tag)}
                                  style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: selected ? "#00A9F4" : "#445",
                                    backgroundColor: selected
                                      ? "rgba(0,169,244,0.2)"
                                      : "transparent",
                                    marginRight: 6,
                                    marginBottom: 6,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: selected ? "#EAF6FF" : "#cfe8ff",
                                      fontSize: 12,
                                    }}
                                  >
                                    {tag}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                }}
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                  backgroundColor: submitting ? "#007bb8" : "#00A9F4",
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                {submitting ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator />
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: 16,
                        marginLeft: 10,
                      }}
                    >
                      Zapisywanie…
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                  >
                    Zapisz oceny
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default RateParticipantsModal;
