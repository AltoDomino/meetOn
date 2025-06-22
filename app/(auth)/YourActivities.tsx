import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useActivity } from "../context/ActivityContext";
import { loadActivities, saveActivities } from "@/utilis/activityStoarage";
import { styles } from "../styles/YourActivites.styles";
import { router } from "expo-router";
import { activityImages } from "../Activity/Activities";

export default function YourActivities() {
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

  const handleRemoveActivity = async (activity: string) => {
    Alert.alert(
      "Usuń aktywność",
      `Czy na pewno chcesz usunąć "${activity}" z listy?`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            const updated = activities.filter((a) => a !== activity);
            setActivities(updated);
            await saveActivities(userName, updated);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: string }) => {
    const imageSource = activityImages[item];
    return (
      <TouchableOpacity
        style={styles.tile}
        onLongPress={() => handleRemoveActivity(item)}
      >
        <ImageBackground
          source={imageSource}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: 12, opacity: 0.85 }}
        >
          <Text style={styles.tileText}>{item}</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoje aktywności</Text>

      <FlatList
        data={activities}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.tilesContainer}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/Activity/Activity")}>
        <Text style={styles.addButtonText}>Dodaj nową aktywność</Text>
      </TouchableOpacity>
    </View>
  );
}