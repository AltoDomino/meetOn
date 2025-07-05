import { loadActivities, saveActivities } from "@/utilis/activityStoarage";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useActivity } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/YourActivites.styles";
import { activityImages } from "../Activity/Activities";

export default function YourActivities() {
  const { userName, userId } = useAuth();
  const { activities, setActivities } = useActivity();
  console.log("🧪 YourActivities: userId =", userId, "userName =", userName);
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
            console.log(userId, "czy userid istnieje ");
            await fetch(`http://192.168.1.26:3000/api/interests/${userId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ interests: updated }),
            });
            console.log(userId, "czy user id istneije ");
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/Activity/Activity")}
      >
        <Text style={styles.addButtonText}>Dodaj nową aktywność</Text>
      </TouchableOpacity>
    </View>
  );
}
