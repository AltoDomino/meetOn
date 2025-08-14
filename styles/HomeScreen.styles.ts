import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // pełnoekranowe tło z logo
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#01032f",
  },
  // przesunięcie obrazu tła w górę
  backgroundImageInner: {
    top: -90,
    transform: [{ scale: 1 }]
  },

  // kontener na treść
  overlay: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },

  greeting: {
    fontSize: 80,
    color: "#B0DFFF",
    marginTop: -40, // przesunięcie w górę
  },
  greetingUser: {
    fontSize: 60,
    color: "#B0DFFF",
    fontWeight: "bold",
    marginTop: -5, // lekkie przesunięcie w górę
  },
  header: {
    fontSize: 35,
    fontWeight: "700",
    color: "#00E6FB",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  description: {
    fontSize: 16,
    color: "#E1F1FF",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: "#00C1F3",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#00E6FB",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#0d1a4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
