import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f0f6ff", // jasny niebieski jako tło
  },
  input: {
    height: 50,
    borderColor: "#cce4ff", // jasny niebieski
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#e6f0ff", // bardzo jasny niebieski
    fontSize: 17,
    shadowColor: "#1E90FF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  button: {
    backgroundColor: "#1E90FF", // Dodger Blue
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#1E90FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  registration: {
    marginTop: 32,
    alignItems: "center",
  },
  registrationText: {
    fontSize: 16,
    color: "#2f3e50", // stonowany granat
    marginBottom: 8,
  },
  registrationButton: {
    backgroundColor: "#339CFF", // jaśniejszy niebieski odcień
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  registrationButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default styles;
