import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import * as Location from "expo-location"; 
import { useEffect } from "react";
import fetchPlaces from "@/utilis/FetchActivityPlaces";

import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useActivity } from "../context/ActivityContext";

export default function CreateEventForm() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spots, setSpots] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [activity,setSelectedActivity] =useState("")
const { activities }:any = useActivity();


useEffect(() => {
  const fetchNearbyPlaces = async () => {
    if (!activity) return; 
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Brak dostępu do lokalizacji");
      return;
    }

    try {
      const userLocation = await Location.getCurrentPositionAsync({});
      const lat = userLocation.coords.latitude;
      const lng = userLocation.coords.longitude;

      const result = await fetchPlaces(activity, lat, lng);
      setPlaces(result);
      console.log(result)
    } catch (error) {
      console.error(error);
    }
  };

  fetchNearbyPlaces();
}, [activity]);
console.log("lol",activities)
  // const handleCreateEvent = () => {
  //   const newEvent = {
  //     activity: selectedActivity,
  //     location,
  //     date: date.toLocaleString(),
  //     spots,
  //   };
  //   router.replace("/(auth)/CreateEvent");
  // };

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
        {!activities ? (
          <>
            <Text style={styles.label}>Wybierz aktywność:</Text>
            {activities && activities.map((activity:string) => (
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
              {/* Wybrana aktywność: {setSelectedActivity} */}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Wpisz lokalizację"
              value={location}
              onChangeText={setLocation}
            />
               <View>
      <FlatList
        data={places}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </View>
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
            {/* <Button title="Zatwierdź wydarzenie" onPress={handleCreateEvent} /> */}
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
