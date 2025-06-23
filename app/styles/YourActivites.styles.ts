import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 60) / 2;

export const styles = StyleSheet.create({
container: {
  flex: 1,
  padding: 20,
  gap: 16,
  backgroundColor: "transparent", 
},

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,

    textAlign: "center",
  },

  tilesContainer: {
    gap: 16,
    justifyContent: "center",
  },

  tile: {
    width: tileSize,
    height: tileSize,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
  },

  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },

  tileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  addButton: {
    backgroundColor: "#007AFF", // spójny z niebieskim w CreateEvent
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
