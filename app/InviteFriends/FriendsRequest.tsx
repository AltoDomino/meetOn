import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/FriendsRequest.styles";

type Request = {
  requesterId: number;
  userName: string;
};
type Props = {
  onAccepted: () => void;
};

export default function FriendRequests({ onAccepted }: Props) {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);

  const fetchRequests = async () => {
    const res = await fetch(
      `http://192.168.1.26:3000/api/invite-friends/requests/${userId}`
    );
    const data = await res.json();
    setRequests(data);
  };

  const acceptRequest = async (requesterId: number) => {
    await fetch(`http://192.168.1.26:3000/api/invite-friends/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: requesterId, receiverId: userId }),
    });
    fetchRequests();
    onAccepted();
  };

  useEffect(() => {
    if (userId) fetchRequests();
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Otrzymane zaproszenia</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.requesterId.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.userName}</Text>
              <TouchableOpacity
                onPress={() => acceptRequest(item.requesterId)}
                style={styles.acceptButton}
              >
                <Text style={styles.buttonText}>Akceptuj</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
