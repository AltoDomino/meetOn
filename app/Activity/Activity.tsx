import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { router, Stack } from "expo-router";
import { styles } from "../styles/Activity.styles";
import { Ionicons } from "@expo/vector-icons";

const activities = [
  "Gry planszowe",
  "Tenis stołowy",
  "Escape room",
  "Kręgle",
  "Laser tag",
  "Karaoke",
];

export default function Activity() {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((item) => item !== activity)
        : [...prev, activity]
    );
  };

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
            <TouchableOpacity onPress={() => router.replace("/HomeScreen")}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: "#121212"
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
      </View>
      
    </>
  );
}
