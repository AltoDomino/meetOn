import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

interface Participant {
  id: number;
  userName: string;
  age: number;
  avatar?: string;
  description?: string;
  isCreator?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  participants: Participant[] | undefined;
}

const EventDetails = ({ visible, onClose, participants }: Props) => {
  const creator = Array.isArray(participants)
    ? participants.find((p) => p.isCreator)
    : undefined;

  const otherParticipants =
    Array.isArray(participants) && creator
      ? participants.filter((p) => p.id !== creator.id)
      : participants || [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Twórca wydarzenia</Text>

          {creator && (
            <View style={styles.creatorCard}>
              <Image
                source={{
                  uri: creator.avatar || "https://via.placeholder.com/100",
                }}
                style={styles.creatorAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.creatorName}>{creator.userName}</Text>
                {creator.description && (
                  <Text style={styles.creatorDescription}>
                    {creator.description}
                  </Text>
                )}
              </View>
            </View>
          )}

          <Text style={[styles.header, { marginTop: 20 }]}>Uczestnicy</Text>

          <FlatList
            data={otherParticipants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.participantCard}>
                <Image
                  source={{
                    uri: item.avatar || "https://via.placeholder.com/60",
                  }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.name}>{item.userName}</Text>
                  <Text style={styles.age}>Wiek: {item.age}</Text>
                  {item.description && (
                    <Text style={styles.description}>{item.description}</Text>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", color: "#888" }}>
                Brak innych uczestników
              </Text>
            }
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  creatorCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  creatorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
  },
  creatorName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  creatorDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  age: {
    fontSize: 14,
    color: "#555",
  },
  description: {
    fontSize: 14,
    color: "#777",
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: "#00A9F4",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default EventDetails;
