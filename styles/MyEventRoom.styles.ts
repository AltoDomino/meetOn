// styles/EventScreenRoom.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  leaveButtonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
  },
  leaveTextWrapper: {
    marginRight: 5,
  },
  leaveButton: {
    fontSize: 12,
    color: "#FF4D4D",
    fontWeight: "600",
  },
  leaveIcon: {
    marginLeft: 4,
  },
  participantsContainer: {
    marginBottom: 16,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  chatContainer: {
    flex: 1,
    marginTop: 8,
  },
});
