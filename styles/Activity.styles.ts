import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 60) / 2;
const radius = 16;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center", // WYŚRODKOWANE
    color: "#000",
  },

  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  // wrapper z klipowaniem – równe zaokrąglenia wszędzie
  tileWrapper: {
    margin: 8,
    borderRadius: radius,
    overflow: "hidden",
  },

  // obszar kafelka
  tile: {
    width: tileSize,
    height: tileSize,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent", // brak szarego tła pod obrazem
    borderRadius: radius,
  },

  // obraz w kafelku: powiększony, żeby ukryć białe krawędzie PNG
  tileImage: {
    borderRadius: radius,
    resizeMode: "cover",
    transform: [{ scale: 1.05 }],
    backgroundColor: "transparent",
  },

  // przy wybraniu – lekkie „wypłowienie” tylko obrazu
  tileImageDim: {
    opacity: 0.55,
  },

  // tekst na środku obrazka
  tileText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // opcjonalnie inny kolor tekstu dla wybranego (możesz zostawić jak jest)
  tileTextSelected: {
    // color: "#ffe600",
  },
});
