import fetchPlaces from "@/utilis/FetchActivityPlaces";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
} from "react-native";

export default function CreateEventForm() {
  const { choosenActivity } = useLocalSearchParams();
  console.log("wybrana aktywność w formie",choosenActivity)
  const [activity, setActivity] = useState(choosenActivity as string);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spots, setSpots] = useState("");
  const [places, setPlaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (choosenActivity) {
      console.log(choosenActivity, "chosen activity");
      setActivity(choosenActivity as string);
    }
  }, [choosenActivity]);

  // Wydzielona funkcja do fetchowania miejsc
  const fetchNearbyPlaces = async () => {
    console.log("Aktywność:", activity);
    setLoading(true);
  
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Brak dostępu do lokalizacji");
      setLoading(false);
      return;
    }
    try {
      const userLocation = await Location.getCurrentPositionAsync({});
      const lat = userLocation.coords.latitude;
      const lng = userLocation.coords.longitude;
      const result = await fetchPlaces("bilard", lat, lng);
      setPlaces(result || []);
      console.log("Wyniki wyszukiwania:", result);
    } catch (error) {
      console.error("Błąd pobierania miejsc:", error);
    }
    setLoading(false);
  };

  // Opcjonalnie możesz automatycznie fetchować po zmianie activity
  useEffect(() => {
    fetchNearbyPlaces();
  }, [activity]);

  const renderPlaceTile = ({ item }: { item: string }) => (
    <View style={styles.placeTile}>
      <Text style={styles.placeText}>{item}</Text>
    </View>
  );

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
        <Button
          title={loading ? "Szukam miejsc..." : "Szukaj miejsc"}
          onPress={fetchNearbyPlaces}
          disabled={loading}
        />

        <Text style={styles.label}>Sugerowane lokalizacje:</Text>
        <FlatList
          data={places}
          keyExtractor={(item) => item}
          renderItem={renderPlaceTile}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          ListEmptyComponent={<Text>Brak wyników</Text>}
        />

        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.input}>
            Wybierz datę: {date.toLocaleDateString()} {date.toLocaleTimeString()}
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
  placeTile: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  placeText: {
    fontSize: 14,
    color: "#333",
  },
});