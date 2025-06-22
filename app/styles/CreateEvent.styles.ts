import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  activitiesList: {
    gap: 12,
    paddingBottom: 20,
  },
  activityTileWrapper: {
    flex: 1,
    margin: 5,
  },
  activityTile: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  activityTileText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  createButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  eventCard: {
    backgroundColor: "#f1f1f1",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
});