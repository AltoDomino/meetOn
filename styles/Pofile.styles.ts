import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#c5def3ff",
    gap: 16,
  },
  avatarHint: {
    textAlign: "center",
    color: "#00A9F4",
    fontWeight: "500",
    fontSize: 16,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    color: "#00A9F4",
    alignSelf: "center",
  },
  input: {
    borderWidth: 2,
    borderColor: "#9ddff3ff",
    backgroundColor: "#ffffffff",
    color: "#000000ff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,

  },
  subscriptionSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#14265c",
    borderRadius: 12,
  },
  subscribeButton: {
    backgroundColor: "#00C2FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
