import { Platform, StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff", // podobny vibe jak reszta apki
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },

  // nagłówek ekranu (TWOI ZNAJOMI / PROFIL)
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    color: "#ffffff",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 13,
    opacity: 0.85,
  },

  // przycisk jak w FriendsList (chatButton vibe)
  headerButton: {
    backgroundColor: "#3A8FB7",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  headerButtonDisabled: {
    opacity: 0.6,
  },

  // karta (jak styles.card)
  card: {
    backgroundColor: "#3A8FB7",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // sekcyjny tytuł wewnątrz karty
  sectionTitle: {
    color: "#EAF6FF",
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 8,
  },

  // avatar row jak FriendList item
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatarWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "rgba(0,169,244,0.55)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarFallbackText: {
    color: "rgba(234,246,255,0.75)",
    fontWeight: "900",
    letterSpacing: 1,
  },

  userName: {
    color: "#EAF6FF",
    fontSize: 18,
    fontWeight: "900",
  },
  helper: {
    color: "rgba(234,246,255,0.65)",
    fontSize: 12,
    marginTop: 2,
  },

  // rating
  ratingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  ratingValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingValue: {
    color: "#EAF6FF",
    fontSize: 28,
    fontWeight: "900",
  },
  ratingCount: {
    color: "rgba(234,246,255,0.65)",
    fontSize: 12,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  muted: {
    color: "rgba(234,246,255,0.65)",
  },

  // tag pills
  pillsRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: "rgba(0,169,244,0.16)",
    borderWidth: 1,
    borderColor: "rgba(0,169,244,0.28)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: {
    color: "#EAF6FF",
    fontWeight: "800",
    fontSize: 11,
  },

  // rank container
  rankBox: {
    height: 118,
    overflow: "hidden",
    justifyContent: "center",
    borderRadius: 16,
  },

  // input (opis)
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#EAF6FF",
    height: 90,
    textAlignVertical: "top",
  },
  counter: {
    color: "rgba(234,246,255,0.6)",
    fontSize: 11,
    marginTop: 8,
    textAlign: "right",
  },
});
