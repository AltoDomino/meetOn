import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  otherMessage: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
    chatWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  listContent: {
    paddingBottom: 60,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  myMessage: {
    justifyContent: "flex-end",
  },
  bubble: {
    backgroundColor: "#e1f5fe",
    borderRadius: 8,
    padding: 10,
    maxWidth: "75%",
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  content: {
    fontSize: 16,
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
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#00A9F4",
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  }
});
