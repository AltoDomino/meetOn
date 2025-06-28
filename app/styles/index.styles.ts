import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  reactLogo: {
    height: 250,
    width: 400,
    resizeMode: "contain",
    position: 'absolute',
    bottom: 0,
    left: 0,
    opacity: 0.15, // lekki efekt przezroczystości tła
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
