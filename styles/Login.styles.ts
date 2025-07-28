import { Dimensions, Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: -Dimensions.get("window").height * 0.1,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  logo: {
    width: 220,
    height: 100,
    marginBottom: 5,
    resizeMode: "contain",
  },
  form: {
    marginTop: 60, 
    position: "absolute",
    bottom: Platform.OS === "ios" ? 180 : 130, 
    left: 30,
    right: 30,
    backgroundColor: "rgba(243, 243, 243, 0.08)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 10,
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
    color: "#000",
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
});

export default styles;
