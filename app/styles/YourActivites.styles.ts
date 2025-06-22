import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  tilesContainer: {
    gap: 12,
  },
  tile: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    overflow: "hidden",
    height: 140,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  tileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
    addButton: {
    backgroundColor: "#1e90ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

});
