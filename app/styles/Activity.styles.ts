import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#1a1a1a",
  },

  tilesContainer: {
    justifyContent: "center",
    gap: 16,
    paddingBottom: 32,
  },

  tile: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 16,
    paddingVertical: 20,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  tileSelected: {
    backgroundColor: "#007AFF",
  },

  tileText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },

  tileTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
