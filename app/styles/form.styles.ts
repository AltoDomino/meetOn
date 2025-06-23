import { Dimensions, StyleSheet } from "react-native";


const screenWidth = Dimensions.get("window").width;
const tileSize = (screenWidth - 60) / 2; 

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  counterContainer: {
    marginBottom: 20,
  },
  counterButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  counterButton: {
    backgroundColor: "#007AFF",
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
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 12,
  },

  submitButton: {
    backgroundColor: "#007AFF", 
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  placeTileContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },

  placeTile: {
    backgroundColor: "#B2FFFF", // jasno cyjanowy
    padding: 16,
    borderRadius: 12,
    width: Dimensions.get("window").width - 40,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  placeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  placeAddress: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
  },

  iconRowBottom: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 10,
  },

  iconButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 8,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },

  datePickerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },

  datePickerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },

  datePickerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
});
