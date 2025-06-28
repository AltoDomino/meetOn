import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // półprzezroczysta warstwa dla czytelności
  },
  content: {
    alignItems: "center",
  },
  greeting: {
    fontSize: 50,
    color: "#B0DFFF",
    marginBottom: 8,
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
  input: {
  width: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  borderRadius: 12,
  padding: 12,
  color: "#fff",
  fontSize: 16,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: "#5BC0FF",
},

});
