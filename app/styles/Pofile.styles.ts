import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
  avatarHint: {
    textAlign: "center",
    color: "#007AFF",
    marginTop: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subscriptionSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
  },
  subscribeButton: {
    backgroundColor: "#00C2FF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
