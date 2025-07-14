import BottomButton from "@/components/Bottombutton";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/form.styles";
import FormDataSend from "./SendDataform";

const DetailsForm = () => {
  const [GenderSplit, setGenderSplit] = useState(false);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [spots, setSpots] = useState("");
  const { userId } = useAuth();
  const { location, address, startDate, endDate, activity } =
    useLocalSearchParams();

  const parsedStartDate = new Date(startDate as string);
  const parsedEndDate = new Date(endDate as string);

  const handleGenderSwitchChange = (value: boolean) => {
    setGenderSplit(value);
  };

  const handleSubmit = async () => {
    if (!spots) {
      alert("Uzupełnij wszystkie wymagane pola");
      return;
    }

    if (!userId) {
      Alert.alert("Błąd", "Brak zalogowanego użytkownika");
      console.log("❌ Brak userId w AuthContext");
      return;
    }

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
    };

    console.log("📤 Wysyłanie eventData:", eventData);

    try {
      await FormDataSend(eventData);

      router.push({
        pathname: "/(auth)/Event",
        params: {
          location: eventData.location,
          address: eventData.address,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          activity: eventData.activity,
          spots: eventData.spots,
        },
      });
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zapisać wydarzenia");
      console.error("❌ Błąd zapisu:", error);
    }
  };

  return (
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
          onValueChange={handleGenderSwitchChange}
          trackColor={{ false: "#ccc", true: "#007AFF" }}
          thumbColor={GenderSplit ? "#fff" : "#f4f3f4"}
        />
      </View>

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
  );
};

export default DetailsForm;
