import fetchPlaces, { Place } from "@/utilis/FetchActivityPlaces";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "../styles/form.styles";

export default function CreateEventForm() {
  const { activity: choosenActivity } = useLocalSearchParams();
  const newActivity = Array.isArray(choosenActivity)
    ? choosenActivity[0]
    : choosenActivity;

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Błąd pobierania miejsc:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNearbyPlaces();
  }, [choosenActivity]);

  const renderPlaceTile = ({ item }: { item: Place }) => {
    const isSelected = selectedPlaceId === item.placeId;

    return (
      <TouchableOpacity
        onPress={() => {
          setCustomLocation("");
          setSelectedPlaceId(item.placeId);
        }}
        style={[
          styles.placeTileContainer,
          isSelected && { backgroundColor: "#D6F6FF" },
        ]}
      >
        <View
          style={[
            styles.placeTile,
            isSelected && { backgroundColor: "#C0F0FF" },
          ]}
        >
          <Text style={styles.placeText}>{item.name}</Text>
          {item.address && (
            <Text style={styles.placeAddress}>{item.address}</Text>
          )}
        </View>

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
      </TouchableOpacity>
    );
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
        <Text style={styles.label}>Lub wpisz własną lokalizację:</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            marginTop: 8,
            marginBottom: 16,
            fontSize: 16,
          }}
          placeholder="Wpisz własną lokalizację"
          value={customLocation}
          onChangeText={setCustomLocation}
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
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            if (!selectedPlaceId && !customLocation) {
              alert("Musisz wybrać miejsce lub wpisać własną lokalizację");
              return;
            }

            const selectedPlace = places.find(
              (p) => p.placeId === selectedPlaceId
            );

            router.push({
              pathname: "/CreateEvent/DetailsForm",
              params: {
                activity: newActivity,
                location: customLocation || selectedPlace?.name || "",
                address: customLocation || selectedPlace?.address || "",
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
              },
            });
          }}
        >
          <Text style={styles.submitButtonText}>Szczegóły Wydarzenia</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
