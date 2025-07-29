import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },

  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  participantsContainer: {
    marginVertical: 12,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    backgroundColor: "#4e54c8",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 16,
    color: "#333",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  eventInfo: {
    flex: 1,
  },

  icon: {
    marginRight: 6,
  },

  leaveButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  leaveTextWrapper: {
    alignItems: "center",
    marginBottom: 4,
  },

  leaveButton: {
    fontSize: 12,
    color: "red",
    fontWeight: "500",
    textAlign: "center",
  },

  leaveIcon: {
    marginTop: 2,
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
    fontStyle: "italic",
  },

  buttonContainer: {
    gap: 20,
  },

creatorContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
  backgroundColor: "#e8f7ff", // Jasnoniebieskie tło pasujące do #00A9F4
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#00A9F4",
  shadowColor: "#00A9F4",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},
  creatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  creatorInitial: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4e54c8",
    justifyContent: "center",
    alignItems: "center",
  },
  creatorInitialText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  creatorName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  creatorAge: {
    fontSize: 14,
    color: "#555",
  },
  creatorDescription: {
    textAlign: "center",
    color: "#666",
    fontSize: 13,
    marginTop: 4,
  },
  creatorTextContainer: {
  marginLeft: 12, // odstęp od avatara
  flexShrink: 1, // żeby nie wypychał poza ekran
},
});
