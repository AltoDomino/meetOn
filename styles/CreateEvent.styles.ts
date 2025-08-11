// Activities.styles.ts
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#c5def3ff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000ff",
    marginBottom: 10,
    textAlign: "center",
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
    backgroundColor: "#14265c",
    borderRadius: 12,
  },
  activityTileText: {
    color: "#E1F1FF",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  createButton: {
    backgroundColor: "#00C1F3",
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
    backgroundColor: "#14265c",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E1F1FF",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#B0DFFF",
  },
});

export default styles;
