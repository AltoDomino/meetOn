import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 60) / 2;
const radius = 16;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginVertical: 8,
  },

  activitiesList: {
    justifyContent: "center",
    alignItems: "center", // 👈 to centruje kafelki w rzędach
    paddingBottom: 100,
    marginTop: -6,
  },

  // wrapper z klipowaniem i spójnymi zaokrągleniami
  activityTileWrapper: {
    width: tileSize,
    height: tileSize,
    margin: 8,
    borderRadius: radius,
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  // obszar kafelka
  activityTile: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius,
    backgroundColor: "transparent", // brak szarego tła
  },

  // obraz – powiększony, by ukryć białe brzegi; równe zaokrąglenia
  activityTileImage: {
    borderRadius: radius,
    resizeMode: "cover",
    transform: [{ scale: 1.05 }],
    backgroundColor: "transparent",
  },

  // stan zaznaczenia: lekko „wypłowiały” obraz
  activityTileImageDim: {
    opacity: 0.65,
  },

  // tekst wycentrowany
  activityTileText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
