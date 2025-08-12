// ../../styles/Event.styles.ts (NOWY/UZUPEŁNIONY plik stylów)
import { StyleSheet, Platform } from "react-native";

const colors = {
  bg: "#c5def3ff",
  card: "#ffffff",
  primary: "#1E3A8A",
  accent: "#007AFF",
  text: "#0B1220",
  muted: "#4B5563",
  border: "rgba(0,0,0,0.08)",
  chipBg: "#cccccc",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    padding: 16,
    backgroundColor: colors.bg,
  },

  switchWrapper: {
    // miejsce na ewentualne marginesy dla SwitchButton
  },
  bellButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  bellIcon: {
    fontSize: 18,
  },

  saveBanner: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,122,255,0.12)", // lekki niebieski
    alignSelf: "stretch",
  },

  saveBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B1220",
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },

  filterChip: {
    backgroundColor: colors.chipBg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  filterChipActive: {
    backgroundColor: colors.accent,
  },

  filterChipText: {
    color: "#000",
    fontWeight: "600",
  },

  filterChipTextActive: {
    color: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // KARTA WYDARZENIA
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
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
    alignItems: "flex-start",
  },

  eventInfo: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },

  participantsBox: {
    alignItems: "center",
    marginLeft: 12,
  },

  participantIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  participantCount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },

  joinButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },

  joinButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

emptyContainer: {
  minHeight: 300, 
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
},
emptyText: {
  fontSize: 16,
  color: colors.muted,
  textAlign: "center",
},
});
