import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router, Stack } from "expo-router";
import { styles } from "../styles/Activity.styles";
import { Ionicons } from "@expo/vector-icons";
import { useActivity } from "../context/ActivityContext";
import { loadActivities, saveActivities } from "../utilis/activityStoarage";
import { useAuth } from "../context/AuthContext";

const activities = [
  "Gry planszowe",
  "Tenis stołowy",
  "Escape room",
  "Kręgle",
  "Laser tag",
  "Karaoke",
];

export default function Activity() {
  const { setActivities } = useActivity();
  const { userName } = useAuth();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

const handleSaveActivity = async () => {
  await saveActivities(userName, selectedActivities);
  setActivities(selectedActivities)
  router.replace("/(auth)/Event");
};
  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((item) => item !== activity)
        : [...prev, activity]
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
        style={[styles.tile, isSelected && styles.tileSelected]}
      >
        <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace("/(auth)/Event")}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerTintColor: "#ffffff",
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Wybierz formę aktywności</Text>
        <FlatList
          data={activities}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.tilesContainer}
        />
        {selectedActivities.length > 0 && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveActivity}>
            <Text style={styles.saveButtonText}>Zapisz aktywność</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
