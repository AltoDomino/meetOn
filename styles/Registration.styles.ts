import { Platform, StyleSheet } from "react-native";

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
    justifyContent: "center", // 👈 wyśrodkowanie w pionie
    alignItems: "center", // 👈 wyśrodkowanie w poziomie
    paddingHorizontal: 20,
    backgroundColor: "#0d1a4d",
  },

  logo: {
    width: 85, // było 100 → -15%
    height: 42, // było 50 → -15%
    marginBottom: 20,
    backgroundColor: "transparent",
  },

  formContainer: {
    width: "85%", // było ~90-100% — mniejsze i wyśrodkowane
    backgroundColor: "rgba(243, 243, 243, 0.08)",
    borderRadius: 14,
    padding: isAndroid ? 12 : 16, // było 14–20 → zmniejszone ~20%
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: isAndroid ? 5 : 6,
    elevation: 6,
  },

  input: {
    height: isAndroid ? 40 : 44, // - ok. 20%
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12, // było 16
    marginBottom: 14, // było 16
    fontSize: 15, // było 16
    backgroundColor: "#fff",
  },

  label: {
    fontSize: 15, // było 16
    marginBottom: 4,
    color: "#fff",
    fontWeight: "600",
  },

  genderPicker: {
    fontSize: 15,
    paddingVertical: 10, // było 12
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingRight: 25, // było 30
    marginBottom: 14, // było 16
    backgroundColor: "#fff",
    color: "#000",
  },

  button: {
    backgroundColor: "#00A9F4",
    paddingVertical: 12, // było 14
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15, // było 16
    fontWeight: "bold",
  },

  link: {
    marginTop: 22, // było 28
    alignItems: "center",
  },

  linkText: {
    fontSize: 15,
    color: "#00A9F4",
    fontWeight: "500",
  },
});

export default styles;
