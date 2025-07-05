import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1, // zamiast flexGrow
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  reactLogo: {
    width: "100%",
    height: undefined,
    aspectRatio: 1, // szerokość / wysokość (dostosuj jeśli trzeba)
    resizeMode: "contain",
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0051cc",
  },
  form: {
    width: "100%",
    backgroundColor: "rgba(243, 243, 243, 0.08)",
    borderRadius: 12,
    padding: 20,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },

  label: {
    fontSize: 14,
    marginBottom: 4,
     color: "#fff",
  },
  input: {
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  noAccountText: {
    textAlign: "center",
    color: "#555",
    marginBottom: 8,
  },
  registerButton: {
    backgroundColor: "#0051cc",
    paddingVertical: 12,
    borderRadius: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logo: {
    width: 260,
    height: 120,
    marginBottom: 20,
  },
});

export default styles;
