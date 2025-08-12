import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, Modal } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/FriendsRequest.styles";

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
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [requestToIgnore, setRequestToIgnore] = useState<Request | null>(null);

  const fetchRequests = async () => {
    const res = await fetch(
      `https://meeton-backend-ffmo.onrender.com/api/invite-friends/requests/${userId}`
    );
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);
  };

  const acceptRequest = async (requesterId: number) => {
    await fetch(`https://meeton-backend-ffmo.onrender.com/api/invite-friends/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: requesterId, receiverId: userId }),
    });
    fetchRequests();
    onAccepted();
  };

  const ignoreRequest = async (requesterId: number) => {
    await fetch(`https://meeton-backend-ffmo.onrender.com/api/invite-friends/ignore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: requesterId, receiverId: userId }),
    });
    fetchRequests();
  };

  const openIgnoreModal = (request: Request) => {
    setRequestToIgnore(request);
    setShowModal(true);
  };

  const confirmIgnore = () => {
    if (requestToIgnore) {
      ignoreRequest(requestToIgnore.requesterId);
    }
    setShowModal(false);
    setRequestToIgnore(null);
  };

  useEffect(() => {
    if (userId) fetchRequests();
  }, [userId]);

  const hasMany = requests.length > 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTRZYMANE ZAPROSZENIA</Text>

      {hasMany && (
        <TouchableOpacity
          onPress={() => setExpanded((e) => !e)}
          style={styles.dropHeader}
          activeOpacity={0.8}
        >
          <Text style={styles.dropHeaderText}>
            {expanded ? "Ukryj" : `Rozwiń (${requests.length})`}
          </Text>
        </TouchableOpacity>
      )}

      {(!hasMany || expanded) && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.requesterId.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.userName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.userName}</Text>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => acceptRequest(item.requesterId)}
                    style={styles.acceptButton}
                  >
                    <Text style={styles.buttonText}>Akceptuj</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openIgnoreModal(item)}
                    style={styles.ignoreButton}
                  >
                    <Text style={styles.buttonText}>Ignoruj</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal potwierdzenia */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Czy na pewno chcesz usunąć to zaproszenie?
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 16 }}>
              <TouchableOpacity
                onPress={confirmIgnore}
                style={styles.confirmButton}
              >
                <Text style={styles.buttonText}>Tak</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Anuluj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
