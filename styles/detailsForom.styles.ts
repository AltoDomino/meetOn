import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1a4d",
    padding: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    color: "#14265c",
    textAlign: "center",
    marginBottom: 8,
  },
  counterContainer: {
    marginBottom: 20,
  },
  counterButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#14265c",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  counterButton: {
    backgroundColor: "#00C1F3",
    borderRadius: 8,
    padding: 10,
  },
  counterText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E1F1FF",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  sliderText: {
    textAlign: "center",
    color: "#E1F1FF",
    marginBottom: 8,
  },
  sliderLabel: {
    fontWeight: "bold",
    color: "#B0DFFF",
    marginBottom: 4,
  },
  sliderContainer: {
    marginVertical: 16,
  },
});
