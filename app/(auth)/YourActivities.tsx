import BottomButton from "../../components/BottomButton";
import { loadActivities, saveActivities } from "../../utilis/activityStoarage";
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
    return (
      <TouchableOpacity
        onLongPress={() => handleRemoveActivity(item)}
        style={styles.tileWrapper}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={activityImages[item]}
          style={styles.tile}
          imageStyle={styles.tileImage}
        >
          <Text style={styles.tileText}>{item}</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}></Text>

      <FlatList
        data={activities}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.tilesContainer}
      />

      <BottomButton
        title="DODAJ NOWĄ AKTYWNOŚĆ"
        onPress={() => router.push("/Activity/Activity")}
      />
    </View>
  );
}
