import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  chatWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#f4faff", // delikatny błękit jak w meetOn
  },

  listContent: {
    paddingVertical: 10,
    paddingBottom: 90, // miejsce na input
  },

  messageRow: {
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "flex-start",
  },

  myMessage: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },

  otherMessage: {
    alignSelf: "flex-start",
  },

  bubble: {
    backgroundColor: "#e1f5fe",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  myBubble: {
    backgroundColor: "#00A9F4", // twoja wiadomość — niebieska
  },

  sender: {
    fontWeight: "bold",
    marginBottom: 2,
    color: "#333",
  },

  content: {
    fontSize: 15,
    color: "#000",
  },

  timestamp: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#d0eaff",
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  input: {
    flex: 1,
    height: 45,
    backgroundColor: "#f7f9fc",
    borderColor: "#cfe9ff",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#000",
    textAlignVertical: "center",
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#00A9F4",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00A9F4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
