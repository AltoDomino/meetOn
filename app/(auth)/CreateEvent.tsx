import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ImageBackground,
} from "react-native";
import { styles } from "../styles/CreateEvent.styles";
import { router } from "expo-router";
import { useActivity } from "../context/ActivityContext";
import { useAuth } from "../context/AuthContext";
import { loadActivities } from "@/utilis/activityStoarage";

const imageMap: Record<string, any> = {
  "Gry planszowe": require("../../assets/images/gry-planszowe.png"),
  "Escape room": require("../../assets/images/Escape-room.png"),
  "Kręgle": require("../../assets/images/kregle.png"),
  "Bilard": require("../../assets/images/bilard.png"),
};

export default function CreateEvent() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null); // ⬅️ dodajemy
  const [error, setError] = useState("");
  const { userName } = useAuth();
  const { activities, setActivities } = useActivity();

  useEffect(() => {
    const fetchActivities = async () => {
      if (userName) {
        const stored = await loadActivities(userName);
        setActivities(stored);
      }
    };
    fetchActivities();
  }, [userName]);

  const renderEvent = ({ item }: any) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.activity}</Text>
      <Text>Lokalizacja: {item.location}</Text>
      <Text>Data: {item.date}</Text>
      <Text>Miejsca: {item.spots}</Text>
    </View>
  );

  const renderActivityTile = ({ item }: { item: string }) => {
    const isSelected = selectedActivity === item;

    return (
      <TouchableOpacity
        style={[
          styles.activityTileWrapper,
          isSelected && { borderWidth: 2, borderColor: "#007AFF" },
        ]}
        onPress={() => setSelectedActivity(item)}
      >
        <ImageBackground
          source={imageMap[item]}
          style={styles.activityTile}
          imageStyle={{ borderRadius: 12 }}
        >
          <Text style={styles.activityTileText}>{item}</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const handleCreateEvent = () => {
    if (!selectedActivity) {
      setError("Najpierw wybierz aktywność!");
      return;
    }

    setError("");
    router.push("/CreateEvent/form");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Wybierz aktywność aby stworzyć wydarzenie</Text>
      <FlatList
        data={activities}
        renderItem={renderActivityTile}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.activitiesList}
      />

      <TouchableOpacity
        style={[
          styles.createButton,
          !selectedActivity && { backgroundColor: "#ccc" },
        ]}
        onPress={handleCreateEvent}
        disabled={!selectedActivity}
      >
        <Text style={styles.createButtonText}>Stwórz swoje wydarzenie</Text>
      </TouchableOpacity>

      {error !== "" && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>}

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
