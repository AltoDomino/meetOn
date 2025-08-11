import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
  },

  logoContainer: {
    width: "100%",
    paddingTop: 60,
    paddingBottom: 10,
    alignItems: "center",
  },

  logo: {
    width: "70%",
    height: 150,
    resizeMode: "contain",
  },

  contentContainer: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 24,
    bottom:80
  },

  greeting: {
    fontSize: 70,
    color: "#B0DFFF",
    marginBottom: 4,
  },

  greetingUser: {
    fontSize: 40,
    color: "#B0DFFF",
    marginBottom: 20,
      fontWeight: "bold", 
  },

  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#00E6FB",
    marginBottom: 16,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    color: "#E1F1FF",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
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
