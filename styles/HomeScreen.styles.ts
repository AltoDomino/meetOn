import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // ✅ pełny ekran
  screen: {
    flex: 1,
    backgroundColor: "#01032f",
  },

  // (logo – jeśli jeszcze gdzieś używasz)
  backgroundImage: {
    width: "70%",
    alignSelf: "center",
    height: height * 0.2,
    backgroundColor: "#01032f",
  },

  backgroundImageInner: {
    resizeMode: "contain",
  },

  // ✅ GŁÓWNY KONTENER TREŚCI
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",

    gap: 10, // 👈 GLOBALNY ODSTĘP MIĘDZY ELEMENTAMI
  },

  // 👋 „Hej”
  greeting: {
    fontSize: 44,
    color: "#B0DFFF",
    marginBottom: 4, // 👈 lekki luz przed imieniem
  },

  // 👤 imię użytkownika
  greetingUser: {
    fontSize: 25,
    color: "#B0DFFF",
    fontWeight: "bold",
    marginBottom: 12, // 👈 większa przerwa przed nagłówkiem
  },

  // 🔹 nagłówek
  header: {
    fontSize: 32,
    fontWeight: "700",
    color: "#00E6FB",
    textAlign: "center",

    marginBottom: 8, // 👈 oddzielenie od opisu

    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // 📝 opis
  description: {
    fontSize: 16,
    color: "#E1F1FF",
    textAlign: "center",
    lineHeight: 24,

    marginBottom: 10, // 👈 wyraźna przerwa przed buttonem

    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // 🔘 przycisk
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

  // ===== MODAL =====
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

    gap: 12, // 👈 ładne odstępy w modalu
  },

  modalText: {
    fontSize: 16,
    textAlign: "center",
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
