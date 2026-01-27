import { backend_URL } from "@/backendURL";
import { useAuth } from "@/context/AuthContext";
import { styles } from "@/styles/CompleteRegistration.styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const CompleteRegistration = () => {
  const { userId, token } = useAuth();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const [items, setItems] = useState([
    { label: "Mężczyzna", value: "male" },
    { label: "Kobieta", value: "female" },
    { label: "Inna", value: "other" },
  ]);

  const router = useRouter();

  const calculateAge = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const handleComplete = async () => {
    if (!birthDate || !gender) {
      Alert.alert("Uzupełnij dane", "Wybierz datę urodzenia i płeć.");
      return;
    }

    const age = calculateAge(birthDate);

    try {
      const res = await fetch(
        `${backend_URL}/api/login/complete-registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            age,
            gender,
            dateOfBirth: birthDate.toISOString(),
            description,
          }),
        },
      );

      if (!res.ok) {
        Alert.alert("Błąd", "Nie udało się zapisać danych.");
        return;
      }

      Alert.alert("Sukces 🎉", "Profil został uzupełniony.");
      router.replace("/(main)/HomeScreen");
    } catch (err) {
      console.error(err);
      Alert.alert("Błąd", "Coś poszło nie tak.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* GRAFIKA (TYLKO DEKORACJA) */}
      <ImageBackground
        source={require("@/assets/images/ikonameeton.png")}
        style={styles.headerBg}
        resizeMode="contain"
        imageStyle={{ width: "100%", height: "100%" }}
      />

      {/* CONTENT */}
      <View style={styles.container}>
        {/* ✅ NAGŁÓWEK FORMULARZA – 10px NAD KARTĄ */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Uzupełnij dane profilu</Text>
        </View>

        {/* FORMULARZ */}
        <View style={styles.card}>
          {/* Data urodzenia */}
          <Text style={styles.label}>Data urodzenia</Text>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.inputLike}
            activeOpacity={0.85}
          >
            <Text style={[styles.inputText, !birthDate && styles.placeholder]}>
              {birthDate
                ? `${birthDate.toLocaleDateString()} • ${calculateAge(
                    birthDate,
                  )} lat`
                : "Wybierz datę urodzenia"}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={tempDate || birthDate || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onChange={(_, selectedDate) => {
                  if (selectedDate) setTempDate(selectedDate);

                  // Android zamyka się sam
                  if (Platform.OS === "android") {
                    setBirthDate(selectedDate || null);
                    setShowPicker(false);
                  }
                }}
              />

              {/* ✅ PRZYCISK ZAMYKAJĄCY MODAL (iOS) */}
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.dateConfirmButton}
                  onPress={() => {
                    if (tempDate) setBirthDate(tempDate);
                    setShowPicker(false);
                    setTempDate(null);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.dateConfirmText}>Gotowe</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Płeć */}
          <Text style={[styles.label, { marginTop: 14 }]}>Płeć</Text>
          <View style={{ zIndex: 2000 }}>
            <DropDownPicker
              open={open}
              value={gender}
              items={items}
              setOpen={setOpen}
              setValue={setGender}
              setItems={setItems}
              placeholder="Wybierz płeć"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              listItemLabelStyle={styles.dropdownItemLabel}
              listMode="SCROLLVIEW"
              zIndex={2000}
              zIndexInverse={1000}
            />
          </View>

          {/* Opis */}
          <Text style={[styles.label, { marginTop: 14 }]}>Opis</Text>
<TouchableOpacity
  onPress={() =>
    Alert.prompt(
      "Opis",
      "Maks. 70 znaków",
      (text) => {
        const value = (text || "").slice(0, 70);
        setDescription(value);
      }
    )
  }
  style={styles.inputLike}
  activeOpacity={0.85}
>
  <Text style={[styles.inputText, !description && styles.placeholder]}>
    {description || "Dodaj krótki opis o sobie"}
  </Text>
</TouchableOpacity>

<Text style={styles.charCounter}>
  {description.length}/70
</Text>


          {/* CTA */}
          <TouchableOpacity
            onPress={handleComplete}
            style={styles.button}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Zapisz i przejdź dalej</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CompleteRegistration;
