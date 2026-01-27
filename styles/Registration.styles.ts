import { Dimensions, Platform, StyleSheet } from "react-native";

const { height } = Dimensions.get("window");
const isAndroid = Platform.OS === "android";

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#0d1a4d",
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#0d1a4d",
    transform: [{ translateY: -height * 0.03 }], // 👈 przesunięcie w górę o 1/4 ekranu
  },

  logo: {
    width: 85, // było 100 → -15%
    height: 42, // było 50 → -15%
    marginBottom: 20,
    backgroundColor: "transparent",
  },

  formContainer: {
    width: "85%", // było ~90-100%
    backgroundColor: "rgba(243, 243, 243, 0.08)",
    borderRadius: 14,
    padding: isAndroid ? 12 : 16,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: isAndroid ? 5 : 6,
    elevation: 6,
  },

  input: {
    height: isAndroid ? 40 : 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: "#fff",
  },

  label: {
    fontSize: 15,
    marginBottom: 4,
    color: "#fff",
    fontWeight: "600",
  },

  genderPicker: {
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingRight: 25,
    marginBottom: 14,
    backgroundColor: "#fff",
    color: "#000",
  },

  button: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },

  link: {
    marginTop: 22,
    alignItems: "center",
  },

  linkText: {
    fontSize: 15,
    color: "#1E3A8A",
    fontWeight: "500",
  },
});

export default styles;
