import fetchPlaces, { Place } from "@/utilis/FetchActivityPlaces";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  Alert,
  Button,
  FlatList,
  Linking,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/form.styles";

export default function CreateEventForm() {
  const { activity: choosenActivity } = useLocalSearchParams();
  const newActivity = Array.isArray(choosenActivity)
    ? choosenActivity[0]
    : choosenActivity;
  console.log("wybrana aktywność w formie", choosenActivity);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spots, setSpots] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [GenderSplit, setGenderSplit] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  console.log("activiity", choosenActivity);
  useEffect(() => {
    if (choosenActivity) {
      console.log(choosenActivity, "chosen activity");
    }
  }, [choosenActivity]);

  const fetchNearbyPlaces = async () => {
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
      const result = await fetchPlaces(newActivity, lat, lng);
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
  }, [choosenActivity]);

  const renderPlaceTile = ({ item }: { item: Place }) => (
    <View style={styles.placeTileContainer}>
      <View style={styles.placeTile}>
        <Text style={styles.placeText}>{item.name}</Text>
        {item.address && (
          <Text style={styles.placeAddress}>{item.address}</Text>
        )}
      </View>

      {/* Ikony poniżej kafelka */}
      <View style={styles.iconRowBottom}>
        {item.phone && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
            style={styles.iconButton}
          >
            <Ionicons name="call-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {item.website && (
          <TouchableOpacity
            onPress={() => Linking.openURL(item.website!)}
            style={styles.iconButton}
          >
            <Ionicons name="globe-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleGenderSwitchChange = (value: boolean) => {
    setGenderSplit(value);

    if (value) {
      console.log("🔄 Włączono podział na płeć 50/50");
      if (parseInt(spots) % 2 !== 0) {
        console.warn("⚠️ Podział wymaga parzystej liczby miejsc!");
      }
    } else {
      console.log("❌ Wyłączono podział na płeć");
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>Sugerowane lokalizacje:</Text>
        <FlatList
          data={places}
          keyExtractor={(item) => item.placeId}
          renderItem={renderPlaceTile}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text>Brak wyników</Text>}
        />

        <Text style={styles.label}>Data i godzina wydarzenia:</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.datePickerBox}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.datePickerLabel}>Start</Text>
            <Text style={styles.datePickerText}>
              {startDate.toLocaleDateString()} {startDate.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.datePickerBox}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.datePickerLabel}>Koniec</Text>
            <Text style={styles.datePickerText}>
              {endDate.toLocaleDateString()} {endDate.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
        </View>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="datetime"
            display="default"
            onChange={(e, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="datetime"
            display="default"
            onChange={(e, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}

        <View style={styles.counterContainer}>
          <Text style={styles.label}>Ilość miejsc</Text>
          <View style={styles.counterButtons}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() =>
                setSpots((prev) =>
                  Math.max(1, parseInt(prev || "1") - 1).toString()
                )
              }
            >
              <Text style={styles.counterText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.counterValue}>{spots || "1"}</Text>

            <TouchableOpacity
              style={styles.counterButton}
              onPress={() =>
                setSpots((prev) =>
                  Math.min(6, parseInt(prev || "0") + 1).toString()
                )
              }
            >
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <View style={styles.switchLabelRow}>
            <Text style={styles.label}>Podział na płeć</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Co to znaczy?",
                  "Jeżeli chcesz, aby na wydarzenie przyszła podobna ilość kobiet jak i mężczyzn, zaznacz tę opcję. Aplikacja postara się to wyegzekwować."
                )
              }
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color="#007AFF"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>

          <Switch
            value={GenderSplit}
            onValueChange={handleGenderSwitchChange}
            trackColor={{ false: "#ccc", true: "#007AFF" }}
            thumbColor={GenderSplit ? "#fff" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            if (!spots || !date || !places[0]) {
              alert("Uzupełnij wszystkie wymagane pola");
              return;
            }
            router.push({
              pathname: "/Event",
              params: {
                activity: newActivity,
                location: places[0].name,
                address: places[0].address ?? "",
                spots,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                genderSplit: GenderSplit.toString(),
              },
            });
          }}
        >
          <Text style={styles.submitButtonText}>Zatwierdź wydarzenie</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
