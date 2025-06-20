import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

export default function CreateEvent() {
  const [events, setEvents] = useState<any[]>([]);

  const renderEvent = ({ item }: any) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.activity}</Text>
      <Text>Lokalizacja: {item.location}</Text>
      <Text>Data: {item.date}</Text>
      <Text>Miejsca: {item.spots}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/CreateEvent/form")}
      >
        <Text style={styles.createButtonText}>Stwórz swoje wydarzenie</Text>
      </TouchableOpacity>

      {events.length === 0 ? (
        <Text style={styles.emptyText}>Brak Twoich wydarzeń</Text>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  createButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  eventCard: {
    backgroundColor: "#f1f1f1",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
});
