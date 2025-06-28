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
    marginBottom: 10,
  },
  welcomeText: {

    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0051cc",
  },
  form: {
    width: "100%",
    backgroundColor: "#f5f5f5",

    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
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

});

export default styles;
