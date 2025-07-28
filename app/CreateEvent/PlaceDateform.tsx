import BottomButton from "@/components/Bottombutton";
import fetchPlaces, { Place } from "@/utilis/FetchActivityPlaces";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { styles } from "../../styles/form.styles";

export default function PlaceDateform() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleString("pl-PL", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { activity: choosenActivity, customOnly } = useLocalSearchParams();
  const newActivity = Array.isArray(choosenActivity)
    ? choosenActivity[0]
    : choosenActivity;
  const isCustomOnly = customOnly === "true";

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const initialStartDate = new Date();
  initialStartDate.setHours(initialStartDate.getHours() + 1);

  const initialEndDate = new Date(initialStartDate);
  initialEndDate.setHours(initialStartDate.getHours() + 1);

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const [customLocation, setCustomLocation] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

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
    if (!isCustomOnly) {
      fetchNearbyPlaces();
    }
  }, [choosenActivity]);

  const handleStartConfirm = (date: Date) => {
    setStartDate(date);
    const newEnd = new Date(date);
    newEnd.setHours(newEnd.getHours() + 1);
    setEndDate(newEnd);
    setStartPickerVisible(false);
  };

  const handleEndConfirm = (date: Date) => {
    setEndDate(date);
    setEndPickerVisible(false);
  };

  const renderPlaceTile = ({ item }: { item: Place }) => {
    const isSelected = selectedPlaceId === item.placeId;

    return (
      <TouchableOpacity
        onPress={() => {
          setCustomLocation("");
          setSelectedPlaceId(item.placeId);
        }}
        style={styles.placeTileContainer}
      >
        <View
          style={[
            styles.placeTile,
            isSelected && {
              borderColor: "#00C1F3",
              borderWidth: 6,
            },
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

  const handleSubmit = () => {
    if (!selectedPlaceId && !customLocation) {
      alert("Musisz wybrać miejsce lub wpisać własną lokalizację");
      return;
    }

    const selectedPlace = places.find((p) => p.placeId === selectedPlaceId);

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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <View style={{ flex: 1 }}>
        {!isCustomOnly && (
          <>
            <Text style={styles.label}>Sugerowane lokalizacje:</Text>
            <View style={{ maxHeight: Platform.OS === "ios" ? "54%" : "45%" }}>
              <FlatList
                data={places}
                keyExtractor={(item) => item.placeId}
                renderItem={renderPlaceTile}
                showsVerticalScrollIndicator={true}
                ListEmptyComponent={
                  <Text style={{ color: "gray",textAlign: "center" }}>Ładowanie...</Text>
                }
              />
            </View>
          </>
        )}

        <Text style={styles.label}>Wpisz własną lokalizację:</Text>
        <TextInput
          style={styles.input}
          placeholder="Wpisz własną lokalizację"
          placeholderTextColor="gray"
          value={customLocation}
          onChangeText={setCustomLocation}
        />

        <Text style={styles.label}>Data i godzina wydarzenia:</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.datePickerBox}
            onPress={() => setStartPickerVisible(true)}
          >
            <Text style={styles.datePickerLabel}>Start</Text>
            <Text style={styles.datePickerText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.datePickerBox}
            onPress={() => setEndPickerVisible(true)}
          >
            <Text style={styles.datePickerLabel}>Koniec</Text>
            <Text style={styles.datePickerText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isStartPickerVisible}
          mode="datetime"
          date={startDate}
          onConfirm={handleStartConfirm}
          onCancel={() => setStartPickerVisible(false)}
        />
        <DateTimePickerModal
          isVisible={isEndPickerVisible}
          mode="datetime"
          date={endDate}
          onConfirm={handleEndConfirm}
          onCancel={() => setEndPickerVisible(false)}
        />

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: Platform.OS === "ios" ? 0 : 10,
            paddingBottom: Platform.OS === "ios" ? 20 : 0,
            paddingHorizontal: 20,
            backgroundColor: "#fff",
          }}
        >
          <BottomButton title="Szczegóły Wydarzenia" onPress={handleSubmit} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
