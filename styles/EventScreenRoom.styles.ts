// styles/EventScreenRoom.styles.ts
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4faff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  creatorInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00A9F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  creatorInitialText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  creatorTextContainer: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  creatorAge: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  creatorDescription: {
    fontSize: 14,
    color: "#444",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    marginLeft: 12,
  },
  leaveButtonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  leaveTextWrapper: {
    flexDirection: "column",
    marginRight: 6,
  },
  leaveButton: {
    color: "red",
    fontSize: 12,
  },
  leaveIcon: {
    marginTop: 2,
  },
  participantsContainer: {
    marginVertical: 12,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00A9F4",
    marginBottom: 8,
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d0eaff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#0077cc",
    fontSize: 18,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  chatContainer: {
    marginTop: 10,
    paddingBottom: Platform.select({
      ios: 50,
      android: 80,
      default: 60,
    }),
  }
});
