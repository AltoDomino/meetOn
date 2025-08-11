import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/FrielndList.styles";
import FriendRequests from "../InviteFriends/FriendsRequest";
import SendFriendRequest from "../InviteFriends/SendFriendRequest";

type Friend = {
  id: number;
  userName: string;
};

export default function FriendsList() {
  const { userId } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchFriends = async () => {
    try {
      const res = await fetch(
        `https://meeton-backend-ffmo.onrender.com/api/invite-friends/${userId}`
      );
      const data = await res.json();
      setFriends(data);
    } catch (error) {
      console.error("Błąd pobierania znajomych:", error);
    }
  };

  useEffect(() => {
    if (userId) fetchFriends();
  }, [userId]);

  // ← opóźnione odświeżenie
  const refreshWithDelay = () => {
    setTimeout(() => {
      fetchFriends();
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <FriendRequests onAccepted={refreshWithDelay} />
      <SendFriendRequest onRequestSent={refreshWithDelay} />
      <Text style={styles.title}>Twoi znajomi</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.userName}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
