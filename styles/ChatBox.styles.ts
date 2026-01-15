import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  otherMessage: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  chatWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  listContent: {
    paddingBottom: 70,
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

  /* ⬇️ TU ZMIANA: przesunięcie inputu i przycisku 10 px niżej na iOS */
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    paddingHorizontal: 6,
    paddingBottom: Platform.OS === "android" ? 6 : 0,
    backgroundColor: "#fff",
    transform: [{ translateY: Platform.OS === "ios" ? 10 : 0 }],
  },

  input: {
    flex: 1,
    height: 30,
    borderColor: "#9ddff3ff",
    backgroundColor: "#ffffffff",
    color: "#000000ff",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#3A8FB7",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 42,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
