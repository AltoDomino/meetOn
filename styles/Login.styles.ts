// styles/Login.styles.ts
import { Dimensions, Platform, StyleSheet } from "react-native";

const { height: H } = Dimensions.get("window");
const isSmallDevice = H < 700;

// odstęp od górnej krawędzi dla logo
const LOGO_TOP = Platform.select({
  ios: isSmallDevice ? 28 : 48,
  android: isSmallDevice ? 16 : 32,
})!;

// skala formularza (−1/3 => ~66.7%)
const FORM_SCALE = 0.9;

// przesunięcie formularza o 1/5 wysokości ekranu w dół
const FORM_SHIFT_Y = Platform.select({
  android: H * 0.06, // ✅ Twoje obecne (Android)
  ios: H * 0.09,     // ✅ nowe (iOS)
})!;

// bazowe „bottom” z poprzednich ustawień
const BASE_BOTTOM = Platform.select({
  ios: isSmallDevice ? 140 : 180,
  android: isSmallDevice ? 100 : 130,
})!;

// nowe „bottom” po przesunięciu w dół — nie mniej niż 0
const FORM_BOTTOM = Math.max(0, BASE_BOTTOM - FORM_SHIFT_Y);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#01032f",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginTop: -H * 0.1,
    backgroundColor: "#01032f", // ← wymagany kolor tła
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 0, // logo jest absolutne
    zIndex: 0,
  },

  // ───────── LOGO ─────────
  logoWrap: {
    position: "absolute",
    top: LOGO_TOP,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10, // nad formularzem
    elevation: 20, // Android
    pointerEvents: "none",
  },

  logo: {
    width: 180,
    height: 60,
    marginBottom: 1,
    resizeMode: "contain",
  },

  // ───────── FORM ─────────
  form: {
    position: "absolute",
    bottom: FORM_BOTTOM, // ↓ o 1/5 ekranu
    left: 20,
    right: 20,
    zIndex: 1,

    // zmniejszenie o 1/3
    transform: [{ scale: FORM_SCALE }],

    // półtransparentny panel w tonacji brandu
    backgroundColor: "rgba(13, 26, 77, 0.20)",
    borderRadius: 16,
    padding: 18,

    // delikatna ramka i cienie
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 12,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#EAF1FF",
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  input: {
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DADDE2",
    paddingHorizontal: 14,
    marginBottom: 14,
    color: "#000",
  },

  loginButton: {
    height: 48,
    backgroundColor: "#1E3A8A",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 14,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  noAccountText: {
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 8,
    marginTop: 2,
  },

  registerButton: {
    height: 48,
    backgroundColor: "#0d1a4d",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  registerButtonText: {
    color: "#EAF6FF",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  // separator
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  separatorText: {
    marginHorizontal: 10,
    color: "#EAF1FF",
    fontSize: 12,
    opacity: 0.9,
  },

  // social
  socialColumn: {
    marginTop: 6,
    gap: 12,
  },

  socialBtn: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  googleBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#dadce0",
  },

  googleText: {
    color: "#3c4043",
    fontWeight: "600",
    fontSize: 15,
  },

  appleBtn: {
    width: "100%",
    height: 48,
    marginTop: 2,
    borderRadius: 8,
  },

  socialText: {
    fontWeight: "600",
    fontSize: 15,
  },
});

export default styles;
