import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const mockActivities = ["Gry planszowe", "Tenis stołowy", "Escape room"];

export default function CreateEventForm() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spots, setSpots] = useState("");

  const handleCreateEvent = () => {
    const newEvent = {
      activity: selectedActivity,
      location,
      date: date.toLocaleString(),
      spots,
    };

    // Tu zapis do stanu globalnego, API lub local storage

    router.replace("/(auth)/CreateEvent");
  };

  return (
    <>
            <Stack.Screen
              options={{
                headerShown: true,
                title: "Nowe wydarzenie",
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
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
        {!selectedActivity ? (
          <>
            <Text style={styles.label}>Wybierz aktywność:</Text>
            {mockActivities.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={styles.optionButton}
                onPress={() => setSelectedActivity(activity)}
              >
                <Text style={styles.optionText}>{activity}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.label}>
              Wybrana aktywność: {selectedActivity}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Wpisz lokalizację"
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.input}>
                Wybierz datę: {date.toLocaleDateString()}{" "}
                {date.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={(e, selectedDate) => {
                  const currentDate = selectedDate || date;
                  setShowDatePicker(false);
                  setDate(currentDate);
                }}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Ilość miejsc"
              keyboardType="numeric"
              value={spots}
              onChangeText={setSpots}
            />
            <Button
              title="Zatwierdź wydarzenie"
              onPress={handleCreateEvent}
            />
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: "#e6f0ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
  },
});
