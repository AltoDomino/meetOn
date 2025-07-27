import { loadActivities, saveActivities } from "@/utilis/activityStoarage";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useActivity } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/YourActivites.styles";
import { activityImages } from "../Activity/Activities";
import BottomButton from "@/components/Bottombutton";

export default function YourActivities() {
  const { userName, userId } = useAuth();
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
            await fetch(
              `https://meeton-backend-ffmo.onrender.com/api/interests/${userId}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ interests: updated }),
              }
            );
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: string }) => {
    const imageSource = activityImages[item];
    return (
      <TouchableOpacity onLongPress={() => handleRemoveActivity(item)}>
        <View style={styles.tile}>
          <ImageBackground
            source={imageSource}
            style={styles.imageBackground}
            imageStyle={{ borderRadius: 12, opacity: 0.85 }}
          >
            <Text style={styles.tileText}>{item}</Text>
          </ImageBackground>
        </View>
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

      <BottomButton
        title="Dodaj nową aktywność"
        onPress={() => router.push("/Activity/Activity")}
      />
    </View>
  );
}
