import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventInfoBox: {
    flex: 1,
  },
  eventText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  eventSubText: {
    fontSize: 14,
    color: "#555",
  },
  leaveButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  avatarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 30,
    gap: 12,
    flexWrap: "wrap",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 6,
  },
  chatContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 12,
  },
  chatMessage: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 8,
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
  },
});
