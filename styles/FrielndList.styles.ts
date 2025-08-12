// FriendList.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5def3ff",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000ff",
    textAlign: "center",
    marginVertical: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14265c",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00C1F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#E1F1FF",
  },
  chatButton: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  backgroundColor: "#2563eb",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 8,
  alignSelf: "flex-start",
  marginTop: 6,
},
chatButtonText: {
  color: "#fff",
  fontWeight: "600",
},

chatModalHeader: {
  paddingTop: 52,
  paddingBottom: 12,
  paddingHorizontal: 16,
  backgroundColor: "#0b1220",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
chatModalTitle: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
},
chatModalClose: {
  backgroundColor: "rgba(255,255,255,0.12)",
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 10,
},
chatModalCloseText: {
  color: "#fff",
  fontWeight: "600",
},
  chatContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 12,
    paddingBottom: 8,
  },
});
