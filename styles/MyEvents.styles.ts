// styles/MyEvents.styles.ts
import { StyleSheet, Platform } from "react-native";

const colors = {
  bg: "#F9F9F9",
  card: "#FFFFFF",
  primary: "#1E3A8A",
  accent: "#007AFF",
  text: "#0B1220",
  muted: "#4B5563",
  border: "rgba(0,0,0,0.08)",
};

export const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },

  card: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    marginHorizontal: 12, // ⬅️ żeby nie dochodziło do krawędzi ekranu
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

  listHeader: {
    paddingHorizontal: 12, // ⬅️ żeby przycisk SwitchButton też miał odstęp
    marginBottom: 16,
    backgroundColor: colors.bg,
  },

  emptyText: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginTop: 20,
  },
});
