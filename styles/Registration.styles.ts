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
    paddingHorizontal: 16, // było 20
    paddingTop: 8, // było 10
    backgroundColor: "#0d1a4d",
  },

  logo: {
    width: 100, // było 100
    height: 70, // było 50
    marginBottom: 16, // było 20
    backgroundColor: "transparent",
  },

  formContainer: {
    position: "absolute",
    bottom: isAndroid ? 80 : 100, 
    left: isAndroid ? 32 : 24, // było 40 / 30
    right: isAndroid ? 32 : 24, // było 40 / 30
    backgroundColor: "rgba(243, 243, 243, 0.08)",
    borderTopLeftRadius: isAndroid ? 8 : 10, // było 10 / 12
    borderTopRightRadius: isAndroid ? 8 : 10,
    padding: isAndroid ? 11 : 16, // było 14 / 20
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: isAndroid ? 5 : 6, // było 6 / 8
    elevation: isAndroid ? 6 : 8, // było 8 / 10
  },

  input: {
    height: isAndroid ? 36 : 40, // było 44 / 50
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: isAndroid ? 8 : 10, // było 10 / 12
    paddingHorizontal: 12, // było 16
    marginBottom: 12, // było 16
    fontSize: 13, // było 16
    backgroundColor: "#fff",
  },

  label: {
    fontSize: 13, // było 16
    marginBottom: 3, // było 4
    color: "#fff",
    fontWeight: "600",
  },

  genderPicker: {
    fontSize: 13, // było 16
    paddingVertical: 10, // było 12
    paddingHorizontal: 12, // było 16
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10, // było 12
    paddingRight: 24, // było 30
    marginBottom: 12, // było 16
    backgroundColor: "#fff",
    color: "#000",
  },

  button: {
    backgroundColor: "#00A9F4",
    paddingVertical: 11, // było 14
    borderRadius: 10, // było 12
    alignItems: "center",
    marginTop: 12, // było 16
  },

  buttonText: {
    color: "#fff",
    fontSize: 13, // było 16
    fontWeight: "bold",
  },

  link: {
    marginTop: 22, // było 28
    alignItems: "center",
  },

  linkText: {
    fontSize: 13, // było 16
    color: "#00A9F4",
    fontWeight: "500",
  },
});

export default styles;
