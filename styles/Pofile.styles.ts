import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
  avatarHint: {
    textAlign: "center",
    color: "#000000ff", // błękitny tekst
    marginTop: 8,
    fontWeight: "500",
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000000ff", // jasny niebieski
    alignSelf: "center",
  },
  input: {
    borderWidth: 3,
    borderColor: "#00C1F3",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#14265c", // ciemniejszy niebieski
    color: "#E1F1FF", // jasny tekst
  },
  saveButton: {
    backgroundColor: "#00C1F3",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#00E6FB",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subscriptionSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#14265c",
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
