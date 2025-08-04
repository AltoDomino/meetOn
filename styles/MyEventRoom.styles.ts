
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4faff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 12,
    paddingBottom: 8,
  },
});
