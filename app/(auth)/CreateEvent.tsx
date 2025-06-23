import { loadActivities } from "@/utilis/activityStoarage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useActivity } from "../context/ActivityContext";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/CreateEvent.styles";
import { activityImages } from "../Activity/Activities";

export default function CreateEvent() {
  const [events, setEvents] = useState<any[]>([]);
  const [choosenActivity, setChoosenSelectedActivity] = useState<string | null>(null);
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
    const isSelected = choosenActivity === item;

    return (
      <TouchableOpacity
        style={[
          styles.activityTileWrapper,
          isSelected && { borderWidth: 2, borderColor: "#007AFF" },
        ]}
        onPress={() => setChoosenSelectedActivity(item)}
      >
        <ImageBackground
          source={activityImages[item]}
          style={styles.activityTile}
          imageStyle={{ borderRadius: 12 }}
        >
          <Text style={styles.activityTileText}>{item}</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const handleCreateEvent = () => {
    router.push({
      pathname: "/CreateEvent/PlaceDateform",
      params: { activity: choosenActivity },
    });
    console.log("wybrana aktywnosc w createevent",choosenActivity)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Wybierz aktywność aby stworzyć wydarzenie
      </Text>
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
          !choosenActivity && { backgroundColor: "#ccc" },
        ]}
        onPress={handleCreateEvent}
        disabled={!choosenActivity}
      >
        <Text style={styles.createButtonText}>Stwórz swoje wydarzenie</Text>
      </TouchableOpacity>

      {error !== "" && (
        <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>
      )}

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
