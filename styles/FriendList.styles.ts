import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 14,
  },

  titleRow: {
    marginBottom: 2,
  },
  title: {
    color: "#cfe9ff",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 13,
    opacity: 0.85,
  },

  // karta inputu
  inputCard: {
    backgroundColor: "#3A8FB7",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },

  sectionTitle: {
    color: "#EAF6FF",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 10,
  },

  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#EAF6FF",
    fontSize: 15,
  },

  inviteButton: {
    backgroundColor: "#007AFF", // jak w BottomButton
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 110,
    justifyContent: "center",
  },
  inviteButtonDisabled: {
    opacity: 0.55,
  },
  inviteButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  helper: {
    marginTop: 10,
    color: "rgba(234,246,255,0.65)",
    fontSize: 12,
    lineHeight: 16,
  },

  // layout kolumn
  columnsRow: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },

  colHeader: {
    color: "rgba(234,246,255,0.65)",
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 9,
    marginBottom: 8,
  },

  listCard: {
    backgroundColor: "#3A8FB7",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
    padding: 12,
    gap: 10,
    minHeight: 140,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },

  empty: {
    color: "rgba(234,246,255,0.55)",
    paddingVertical: 12,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(0,169,244,0.40)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "rgba(234,246,255,0.85)",
    fontWeight: "900",
    fontSize: 15,
  },

  itemMain: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    color: "#EAF6FF",
    fontWeight: "900",
    fontSize: 15,
  },
  itemSub: {
    marginTop: 2,
    color: "rgba(234,246,255,0.60)",
    fontSize: 12,
  },

  smallBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  smallBtnText: {
    color: "#EAF6FF",
    fontWeight: "900",
    fontSize: 12,
  },

  // mały loader/stan
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: {
    color: "rgba(234,246,255,0.65)",
    fontWeight: "800",
  },
});
