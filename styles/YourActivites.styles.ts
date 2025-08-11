import { Dimensions, StyleSheet, Platform } from "react-native";

const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 60) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start", 
    justifyContent: "center", 
  },

  tile: {
    width: tileSize,
    height: tileSize,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent",
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 },
        }
      : {
          elevation: 4,
        }),
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
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  addButton: {
    backgroundColor: "#007AFF",
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
