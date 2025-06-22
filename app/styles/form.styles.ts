import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

    placeTile: { width: 150, height: 120, marginRight: 10, borderRadius: 10, overflow: "hidden" },
  placeImage: { flex: 1, justifyContent: "flex-end" },
  placeNameContainer: { backgroundColor: "rgba(0,0,0,0.5)", padding: 5 },
  placeText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
