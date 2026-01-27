import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomButton from "../../components/BottomButton";
import { loadActivities, saveActivities } from "../../utilis/activityStoarage";

import ActivityDataSend from "@/utilis/SendActivity";
import { useActivity } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/Activity.styles";
import { activityImages } from "./Activities";

export default function Activity() {
  const { setActivities } = useActivity();
  const { userName, userId, setHasChosenActivities } = useAuth();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const handleSaveActivity = async () => {
    if (!userId) {
      Alert.alert("Błąd", "Nieprawidłowy identyfikator użytkownika");
      return;
    }

    await saveActivities(userName, selectedActivities);
    setActivities(selectedActivities);

    try {
      await ActivityDataSend({
        userId,
        activities: selectedActivities,
      });

      setHasChosenActivities(true);
      router.replace("/(auth)/YourActivities");
    } catch (error) {
      Alert.alert("Błąd", "Aktywności nie zostały dodane, spróbuj jeszcze raz");
    }
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((item) => item !== activity)
        : [...prev, activity],
    );
  };

  useEffect(() => {
    const fetchActivities = async () => {
      if (userName) {
        const stored = await loadActivities(userName);
        if (stored.length) {
          setSelectedActivities(stored);
          setActivities(stored);
        }
      }
    };
    fetchActivities();
  }, [userName]);

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = selectedActivities.includes(item);

    return (
      <TouchableOpacity
        onPress={() => toggleActivity(item)}
        style={styles.tileWrapper}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={activityImages[item]}
          style={styles.tile}
          imageStyle={[
            styles.tileImage, // wspólne style obrazu
            isSelected && styles.tileImageDim, // lekkie „wypłowienie” gdy wybrany
          ]}
        >
          <Text
            style={[styles.tileText, isSelected && styles.tileTextSelected]}
          >
            {item}
          </Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "WYBIERZ AKTYWNOŚĆ",
          headerStyle: {
            backgroundColor: "#1E3A8A",
          },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>WYBIERZ FORMĘ AKTYWNOŚCI</Text>

        <FlatList
          data={Object.keys(activityImages)}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={[
            styles.tilesContainer,
            { paddingBottom: 100 }, // Odstęp od dolnego przycisku
          ]}
        />

        {selectedActivities.length > 0 && (
          <BottomButton title="Zapisz aktywność" onPress={handleSaveActivity} />
        )}
      </View>
    </>
  );
}
