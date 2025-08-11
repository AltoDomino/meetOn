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
});
