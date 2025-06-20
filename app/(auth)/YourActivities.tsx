import React, { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useActivity } from "../context/ActivityContext";
import { useAuth } from "../context/AuthContext";
import { loadActivities } from "../utilis/activityStoarage";

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

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Twoje Aktywności:</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 16, marginVertical: 5 }}>{item}</Text>
        )}
      />
    </View>
  );
}
