import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0e1625",
  },

  // ===== HEADER (tło nad formularzem) =====
  headerBg: {
    top: 0,
    left: 0,
    right: 0,
    height: 110, // ✅ było 110/150 — za mało
    zIndex: 0,
  },

  headerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  title: {
    color: "#EAF2FF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  subtitle: {
    marginTop: 4,
    color: "rgba(234,242,255,0.75)",
    fontSize: 9,
    fontWeight: "600",
  },

  // ===== FORM CONTAINER (CENTROWANIE) =====
  container: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    // ✅ dopasuj (90–130) pod swój wygląd
    zIndex: 1,
  },

  // ===== FORM CARD =====
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    backgroundColor: "rgba(11,16,32,0.92)",
    borderWidth: 1,
    borderColor: "rgba(120,160,255,0.18)",
    borderRadius: 14,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  // ===== LABELS =====
  label: {
    color: "rgba(234,242,255,0.85)",
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 4,
  },

  // ===== INPUT LOOK =====
  inputLike: {
    borderWidth: 1,
    borderColor: "rgba(120,160,255,0.22)",
    backgroundColor: "rgba(5,10,20,0.55)",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  inputText: {
    color: "#EAF2FF",
    fontSize: 13,
    fontWeight: "600",
  },

  placeholder: {
    color: "rgba(234,242,255,0.55)",
  },

  // ===== PICKER WRAP =====
  pickerWrap: {
    marginTop: 6,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(120,160,255,0.18)",
    backgroundColor: "rgba(5,10,20,0.6)",
  },

  // ===== DROPDOWN =====
  dropdown: {
    borderWidth: 1,
    borderColor: "rgba(120,160,255,0.22)",
    backgroundColor: "rgba(5,10,20,0.55)",
    borderRadius: 10,
    minHeight: 34,
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: "rgba(120,160,255,0.22)",
    backgroundColor: "rgba(11,16,32,0.98)",
    borderRadius: 10,
  },

  dropdownText: {
    color: "#EAF2FF",
    fontSize: 10,
    fontWeight: "700",
  },
  headerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,10,20,0.35)",
  },
  formHeader: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    marginBottom: 10, // ✅ dokładnie 10 px nad formularzem
  },

  formTitle: {
    color: "#EAF2FF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  formSubtitle: {
    marginTop: 4,
    color: "rgba(234,242,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },

  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },

  pageTitle: {
    color: "#EAF2FF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  pageSubtitle: {
    marginTop: 4,
    color: "rgba(234,242,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  dropdownPlaceholder: {
    color: "rgba(234,242,255,0.55)",
    fontWeight: "700",
    fontSize: 10,
  },

  dropdownItemLabel: {
    color: "#EAF2FF",
    fontWeight: "700",
    fontSize: 10,
  },

  // ===== BUTTON =====
  button: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#353c50",
    shadowColor: "rgb(47, 107, 255)",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  dateConfirmButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#353c50",
  },
charCounter: {
  alignSelf: "flex-end",
  marginTop: 4,
  fontSize: 11,
  color: "rgba(234,242,255,0.6)",
  fontWeight: "600",
},

  dateConfirmText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  buttonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
