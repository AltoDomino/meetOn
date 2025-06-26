import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import FriendRequests from "../InviteFriends/FriendsRequest";
import SendFriendRequest from "../InviteFriends/SendFriendRequest";
import { styles } from "../styles/FrielndList.styles";

type Friend = {
  id: number;
  userName: string;
};

export default function FriendsList() {
  const { userId } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchFriends = async () => {
    const res = await fetch(
      `http://192.168.1.26:3000/api/invite-friends/${userId}`
    );
    const data = await res.json();
    setFriends(data);
  };

  useEffect(() => {
    if (userId) fetchFriends();
  }, [userId]);

  return ( // ← TU brakowało returna
    <View style={styles.container}>
      <FriendRequests onAccepted={fetchFriends} />
      <SendFriendRequest />
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
