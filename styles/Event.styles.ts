import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventInfo: {
    flex: 1,
    paddingRight: 12,
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
    fontWeight: "bold",
    color: "#007AFF",
    fontSize: 14,
    marginBottom: 8,
  },

  joinButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 4,
  },

  joinButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
