// styles/MyEvents.styles.ts
import { Platform, StyleSheet } from "react-native";

const colors = {
  bg: "#c5def3ff",
  card: "#ffffff",
  primary: "#1E3A8A",
  accent: "#007AFF",
  text: "#0B1220",
  muted: "#4B5563",
  border: "rgba(0,0,0,0.08)",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },

  // Użyj tego w FlatList: contentContainerStyle={styles.listContent}
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: colors.bg,
  },

  // Używane jako ListHeaderComponent i (jeśli chcesz) też jako contentContainerStyle
  listHeader: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.bg,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    // jeśli nie podmienisz contentContainerStyle, zostaw lekkie marginesy kart:
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }
      : { elevation: 3 }),
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  eventInfo: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },

  locationText: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },

  dateText: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },

  creatorText: {
    fontSize: 14,
    color: colors.text,
  },

  participantsBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  participantIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  participantCount: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: "600",
  },

  joinButton: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  joinButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  emptyText: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginTop: 20,
  },
});
