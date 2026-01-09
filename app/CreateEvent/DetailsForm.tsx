import BottomButton from "../../components/BottomButton";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/detailsForom.styles";
import { FormDataSend } from "./SendDataform";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-4590930660721541/1086406483";

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

type Gender = "female" | "male"  | null;

const DetailsForm = () => {
  const [GenderSplit, setGenderSplit] = useState(false);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [spots, setSpots] = useState("1");
  const [loading, setLoading] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  // ✅ NOWE: “szukaj tylko kobiet / tylko mężczyzn”
  const [seekOnlySameGender, setSeekOnlySameGender] = useState(false);

  // ✅ bierzemy z AuthContext
  const { userId, gender } = useAuth() as { userId: number | null; gender: Gender };
console.log(`płeć to ${gender}`)
  const { location, address, startDate, endDate, activity } = useLocalSearchParams();

  const parsedStartDate = new Date(startDate as string);
  const parsedEndDate = new Date(endDate as string);

  const isFemale = gender === "female";
  const isMale = gender === "male";

  const sameGenderLabel = useMemo(() => {
    if (isFemale) return "Szukaj tylko kobiet";
    if (isMale) return "Szukaj tylko mężczyzn";
    return "";
  }, [isFemale, isMale]);

  // 📍 Pobranie lokalizacji
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Brak dostępu do lokalizacji");
        return;
      }

      try {
        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocationCoords({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });

        console.log("📍 Lokalizacja użytkownika:", userLocation.coords);
      } catch (e) {
        console.warn("❌ Nie udało się pobrać lokalizacji:", e);
        Alert.alert("Błąd", "Nie udało się pobrać lokalizacji użytkownika");
      }
    };

    getLocation();
  }, []);

  // 🎬 Reklama interstitial
  useEffect(() => {
    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log("✅ [AD] Reklama załadowana");
      setAdLoaded(true);
    });

    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log("🧩 [AD] Reklama zamknięta przez użytkownika");
      setAdLoaded(false);
      interstitial.load();

      Alert.alert("Sukces", "🎉 Wydarzenie zostało utworzone pomyślnie!", [
        {
          text: "OK",
          onPress: () => router.push("/(auth)/Event"),
        },
      ]);
    });

    interstitial.load();

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, []);

  // ✅ Tworzenie wydarzenia
  const handleSubmit = async () => {
    console.log("🟢 Kliknięto 'Zatwierdź wydarzenie'");

    if (!spots) {
      Alert.alert("Błąd", "Uzupełnij liczbę miejsc");
      return;
    }

    if (!userId) {
      Alert.alert("Błąd", "Brak identyfikatora użytkownika");
      return;
    }

    if (!locationCoords) {
      Alert.alert("Błąd", "Nie udało się pobrać lokalizacji użytkownika");
      return;
    }

    // ✅ jeśli płeć nie jest female/male → nie wysyłamy ograniczenia
    const safeSeekOnlySameGender = isFemale || isMale ? seekOnlySameGender : false;

    const eventData = {
      location: location?.toString() ?? "",
      address: address?.toString() ?? "",
      startDate: parsedStartDate.toISOString(),
      endDate: parsedEndDate.toISOString(),
      activity: activity?.toString() ?? "",
      spots,
      genderSplit: GenderSplit,
      minAge,
      maxAge,
      creatorId: userId,
      latitude: locationCoords.latitude,
      longitude: locationCoords.longitude,

      // ✅ NOWE: filtr “szukaj tylko kobiet/mężczyzn”
      seekOnlySameGender: safeSeekOnlySameGender,
    };

    setLoading(true);
    console.log("🚀 Wysyłanie eventData:", eventData);

    try {
      await FormDataSend(eventData);
      console.log("✅ [EVENT] Wydarzenie utworzone!");

      if (adLoaded) {
        console.log("📺 Wyświetlam reklamę...");
        interstitial.show();
      } else {
        console.log("⚠️ Reklama niegotowa — wyświetlam alert sukcesu");
        Alert.alert("Sukces", "🎉 Wydarzenie zostało utworzone pomyślnie!", [
          {
            text: "OK",
            onPress: () => router.push("/(auth)/Event"),
          },
        ]);
      }
    } catch (error) {
      console.error("❌ Błąd tworzenia wydarzenia:", error);
      Alert.alert("Błąd", "Nie udało się utworzyć wydarzenia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 15 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: "#007AFF" }}>
            Tworzenie wydarzenia...
          </Text>
        </View>
      ) : (
        <>
          {/* Ilość miejsc */}
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
                    Math.min(100, parseInt(prev || "0") + 1).toString()
                  )
                }
              >
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Podział na płeć */}
          <View style={styles.switchContainer}>
            <View style={styles.switchLabelRow}>
              <Text style={styles.label}>Podział na płeć</Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Co to znaczy?",
                    "Jeżeli chcesz, aby na wydarzenie przyszła podobna ilość kobiet jak i mężczyzn, zaznacz tę opcję."
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
              onValueChange={setGenderSplit}
              trackColor={{ false: "#ccc", true: "#007AFF" }}
              thumbColor={GenderSplit ? "#fff" : "#f4f3f4"}
            />
          </View>

          {/* ✅ NOWE: Szukaj tylko kobiet / tylko mężczyzn */}
          {(isFemale || isMale) && (
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelRow}>
                <Text style={styles.label}>{sameGenderLabel}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Co to znaczy?",
                      isFemale
                        ? "Jeśli włączysz tę opcję, wydarzenie będzie widoczne/targetowane tylko dla kobiet."
                        : "Jeśli włączysz tę opcję, wydarzenie będzie widoczne/targetowane tylko dla mężczyzn."
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
                value={seekOnlySameGender}
                onValueChange={setSeekOnlySameGender}
                trackColor={{ false: "#ccc", true: "#007AFF" }}
                thumbColor={seekOnlySameGender ? "#fff" : "#f4f3f4"}
              />
            </View>
          )}

          {/* Preferowany wiek */}
          <Text style={styles.label}>Preferowany wiek uczestników</Text>
          <View style={{ marginVertical: 16 }}>
            <Text style={{ textAlign: "center", marginBottom: 8 }}>
              Od {minAge} do {maxAge} lat
            </Text>

            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
              Minimalny wiek
            </Text>
            <Slider
              minimumValue={18}
              maximumValue={100}
              step={1}
              value={minAge}
              onValueChange={setMinAge}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#ccc"
            />

            <Text style={{ fontWeight: "bold", marginTop: 12, marginBottom: 4 }}>
              Maksymalny wiek
            </Text>
            <Slider
              minimumValue={minAge}
              maximumValue={100}
              step={1}
              value={maxAge}
              onValueChange={setMaxAge}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#ccc"
            />
          </View>

          <BottomButton title="Zatwierdź wydarzenie" onPress={handleSubmit} />
        </>
      )}
    </View>
  );
};

export default DetailsForm;
