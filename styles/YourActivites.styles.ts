import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 60) / 2;
const radius = 16;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },

  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    
  },

  // obudowa z borderRadius
  tileWrapper: {
    margin: 8,
    borderRadius: radius,
    overflow: "hidden",
  },

  tile: {
    width: tileSize,
    height: tileSize,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: radius,
  },

  tileImage: {
    borderRadius: radius,
    resizeMode: "cover",
    transform: [{ scale: 1.07 }], // maskuje białe brzegi
    backgroundColor: "transparent",
  },

  tileText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
