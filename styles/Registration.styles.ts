import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#0d1a4d",
  },

  centeredContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#0d1a4d",
  },

  logo: {
    width: 260,
    height: 120,
    marginBottom: 20,
  },

  formContainer: {
    position: "absolute",
    bottom: 80,
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

  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  label: {
    fontSize: 16,
    marginBottom: 4,
    color: "#fff",
    fontWeight: "600",
  },

  genderPicker: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingRight: 30,
    marginBottom: 16,
    backgroundColor: "#fff", // białe tło
    color: "#000", // czarny tekst
  },

  button: {
    backgroundColor: "#00A9F4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  link: {
    marginTop: 28,
    alignItems: "center",
  },

  linkText: {
    fontSize: 16,
    color: "#00A9F4",
    fontWeight: "500",
  },
});

export default styles;
