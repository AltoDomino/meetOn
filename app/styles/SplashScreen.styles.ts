import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", 
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
    resizeMode: "contain",
  },
  text: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
    letterSpacing: 2,
  },
});
