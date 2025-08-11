import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tilesContainer: {
    gap: 12,
  },
  tileWrapper: {
    flex: 1,
    margin: 6,
    height: 120,
  },
  tile: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  tileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
tileTextSelected: {
  textDecorationLine: "underline",
  color: "#fff", 
},
saveButton: {
  backgroundColor: "#007AFF", 
  padding: 16,
  borderRadius: 12,
  marginTop: 20,
  alignItems: "center",
},
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
export default styles