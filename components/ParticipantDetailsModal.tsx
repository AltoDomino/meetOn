import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TagCount = { tag: string; count: number };

type Props = {
  visible: boolean;
  onClose: () => void;

  participant: any | null;
  rating: { avg: number; count: number } | null;

  // ✅ przyjmujemy cokolwiek, bo w praktyce często wpada string[]
  tags: any;

  // ✅ dodaj: lista uczestników w pokoju (albo chociaż ich liczba)
  participants?: any[];
};

export default function ParticipantDetailsModal({
  visible,
  onClose,
  participant,
  rating,
  tags,
  participants = [],
}: Props) {
  if (!participant) return null;

  const initials = participant?.userName?.charAt(0)?.toUpperCase?.() ?? "?";

  const normalizedTags: TagCount[] = useMemo(() => {
    const arr = Array.isArray(tags) ? tags : [];

    const out: TagCount[] = arr
      .map((t: any) => {
        if (typeof t === "string") {
          const clean = t.trim();
          return clean ? { tag: clean, count: 1 } : null;
        }

        const tag = String(
          t?.tag ?? t?.name ?? t?.label ?? t?.value ?? ""
        ).trim();
        const countRaw = Number(t?.count ?? t?.votes ?? t?.total ?? 1);
        const count = Number.isFinite(countRaw) ? countRaw : 1;

        if (!tag) return null;
        return { tag, count };
      })
      .filter(Boolean) as TagCount[];

    out.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
    return out;
  }, [tags]);

  // ✅ scroll tylko jeśli w pokoju jest >1 uczestnik
  const shouldScroll = (participants?.length ?? 0) > 1;

  const screenH = Dimensions.get("window").height;
  const MODAL_MAX_H = Math.min(screenH * 0.8, 560); // możesz zmienić

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          padding: 18,
        }}
      >
        {/* ✅ stała/max wysokość modalu */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            maxHeight: MODAL_MAX_H,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800" }}>
              Profil uczestnika
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* ✅ Wnętrze modalu: przewijane TYLKO gdy >1 uczestnik */}
          <ScrollView
            style={{ marginTop: 14, flex: 1 }} // flex:1 pilnuje, żeby content nie rozpychał modalu
            contentContainerStyle={{ paddingBottom: 8 }}
            scrollEnabled={shouldScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={shouldScroll}
          >
            {/* Top row */}
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#EAF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {participant?.avatar ? (
                  <Image
                    source={{ uri: participant.avatar }}
                    style={{ width: 64, height: 64 }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "900",
                      color: "#3A8FB7",
                    }}
                  >
                    {initials}
                  </Text>
                )}
              </View>

              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800" }}>
                  {participant.userName}
                </Text>

                {participant?.age ? (
                  <Text style={{ marginTop: 2, color: "#666" }}>
                    Wiek: {participant.age}
                  </Text>
                ) : null}

                {/* Rating */}
                {rating?.avg != null && !Number.isNaN(rating.avg) ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <Ionicons name="star" size={16} color="#3A8FB7" />
                    <Text
                      style={{
                        marginLeft: 6,
                        fontWeight: "800",
                        color: "#1B4D6B",
                      }}
                    >
                      {rating.avg.toFixed(1)}
                    </Text>
                    <Text style={{ marginLeft: 6, color: "#1B4D6B" }}>
                      ({rating.count ?? 0})
                    </Text>
                  </View>
                ) : (
                  <Text style={{ marginTop: 6, color: "#777" }}>Brak ocen</Text>
                )}
              </View>
            </View>

            {/* Description + tags */}
            <Text style={{ fontWeight: "800", marginTop: 12, marginBottom: 6 }}>
              Opis
            </Text>
            <Text style={{ color: "#444", lineHeight: 20 }}>
              {participant?.description?.trim?.()
                ? participant.description
                : "Brak opisu."}
            </Text>

            <Text style={{ fontWeight: "800", marginTop: 14, marginBottom: 6 }}>
              {participant.userName} jest:
            </Text>

            {normalizedTags.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {normalizedTags.slice(0, 30).map((t, idx) => (
                  <View
                    key={`${t.tag}-${idx}`}
                    style={{
                      backgroundColor: "#EAF6FF",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: "#1B4D6B", fontWeight: "700" }}>
                      {t.tag} · {t.count ?? 1}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: "#777" }}>Brak określeń.</Text>
            )}
          </ScrollView>

          {/* Footer (zawsze widoczny, nie scrolluje) */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 12,
              backgroundColor: "#3A8FB7",
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
