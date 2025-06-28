import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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

  formContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)", // przezroczysty ciemny
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,

    color: "#fff",
  },

  label: {
    fontSize: 16,
    marginBottom: 4,
    color: "#fff",
    fontWeight: "600",
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
