import BottomButton from "../../components/BottomButton";
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
import { useActivity } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/CreateEvent.styles";
import { activityImages } from "../Activity/Activities";

export default function CreateEvent() {
  const [choosenActivity, setChoosenSelectedActivity] = useState<string | null>(
    null
  );
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

  // Dodaj pusty kafelek jeśli nieparzysta liczba
  const getFormattedActivities = () => {
    if (activities.length % 2 === 0) return activities;
    return [...activities, "___EMPTY___"];
  };

  const renderActivityTile = ({ item }: { item: string }) => {
    if (item === "___EMPTY___") {
      return <View style={styles.activityTileWrapper} />;
    }

    const isSelected = choosenActivity === item;

    return (
      <TouchableOpacity
        style={styles.activityTileWrapper}
        onPress={() => setChoosenSelectedActivity(item)}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={activityImages[item]}
          style={styles.activityTile}
          imageStyle={[
            styles.activityTileImage,
            isSelected && styles.activityTileImageDim, // przyciemnienie tylko obrazu
          ]}
        >
          <Text style={styles.activityTileText}>{item}</Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const handleCreateEvent = () => {
    if (!choosenActivity) return;

    const mosirActivities = [
      "Tenis ziemny",
      "Piłka nożna",
      "Koszykówka",
      "Tenis stołowy",
    ];
    const isMosir = mosirActivities.includes(choosenActivity);
    const isOther =
      choosenActivity === "STWÓRZ WŁASNE" ||
      choosenActivity === "ROWER" ||
      choosenActivity === "KONCERT";

    const finalActivity = isMosir ? "mosir" : choosenActivity;

    router.push({
      pathname: "/CreateEvent/PlaceDateform",
      params: {
        activity: finalActivity,
        customOnly: isOther ? "true" : "false",
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        WYBIERZ AKTYWNOŚĆ ABY STWORZYĆ WYDARZENIE
      </Text>

      <FlatList
        data={getFormattedActivities()}
        renderItem={renderActivityTile}
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.activitiesList}
      />

      {choosenActivity && (
        <BottomButton title="STWÓRZ WYDARZENIE" onPress={handleCreateEvent} />
      )}
    </View>
  );
}
