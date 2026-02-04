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
  tags: any;
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
  const hasParticipant = !!participant;

  const displayName =
    participant?.userName ??
    participant?.username ??
    participant?.login ??
    "Użytkownik";

  const avatarUri =
    participant?.avatar ??
    participant?.avatarUrl ??
    null;

  const ageValue = participant?.age ?? null;
  const descriptionValue = participant?.description ?? "";

  const initials = displayName?.charAt(0)?.toUpperCase?.() ?? "?";

  const normalizedTags: TagCount[] = useMemo(() => {
    const arr = Array.isArray(tags) ? tags : [];
    return arr
      .map((t: any) => {
        if (typeof t === "string") return { tag: t, count: 1 };
        if (t?.tag) return { tag: t.tag, count: t.count ?? 1 };
        return null;
      })
      .filter(Boolean) as TagCount[];
  }, [tags]);

  if (!hasParticipant) return null;

  const screenH = Dimensions.get("window").height;
  const MODAL_MAX_H = Math.min(screenH * 0.8, 560);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            maxHeight: MODAL_MAX_H,
            minHeight: 200, // 🔑 KLUCZ
          }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800" }}>
              Profil uczestnika
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          {/* ❗️ TU NIE MA flex:1 */}
          <ScrollView
            style={{ marginTop: 14 }}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator
          >
            {/* AVATAR + INFO */}
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
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
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: 64, height: 64 }}
                  />
                ) : (
                  <Text style={{ fontSize: 24, fontWeight: "900" }}>
                    {initials}
                  </Text>
                )}
              </View>

              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800" }}>
                  {displayName}
                </Text>

                {ageValue != null && (
                  <Text style={{ marginTop: 4, color: "#666" }}>
                    Wiek: {ageValue}
                  </Text>
                )}

                {rating && (
                  <Text style={{ marginTop: 4, color: "#444" }}>
                    ⭐ {rating.avg.toFixed(1)} ({rating.count})
                  </Text>
                )}
              </View>
            </View>

            {/* OPIS */}
            <Text style={{ fontWeight: "800", marginBottom: 6 }}>Opis</Text>
            <Text style={{ color: "#444", marginBottom: 12 }}>
              {descriptionValue || "Brak opisu."}
            </Text>

            {/* TAGI */}
            {normalizedTags.length > 0 && (
              <>
                <Text style={{ fontWeight: "800", marginBottom: 6 }}>
                  {displayName} jest:
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {normalizedTags.map((t, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: "#EAF6FF",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>
                        {t.tag} · {t.count}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* FOOTER */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 12,
              backgroundColor: "#1E3A8A",
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              Zamknij
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
