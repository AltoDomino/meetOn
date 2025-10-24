import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { useAuth } from "@/context/AuthContext";
import { backend_URL } from "@/backendURL";
import { useRouter } from "expo-router";

const CompleteRegistration = () => {
  const { userId, token } = useAuth();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Mężczyzna", value: "male" },
    { label: "Kobieta", value: "female" },
    { label: "Inna", value: "other" },
  ]);
  const router = useRouter();

  // 🔹 Funkcja do obliczania wieku
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
      const res = await fetch(`${backend_URL}/api/login/complete-registration`, {
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
        }),
      });

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
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Uzupełnij dane profilu
      </Text>

      {/* 🔹 Wybór daty urodzenia */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: birthDate ? "#000" : "#777" }}>
          {birthDate
            ? `Data urodzenia: ${birthDate.toLocaleDateString()} (${calculateAge(
                birthDate
              )} lat)`
            : "Wybierz datę urodzenia"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={birthDate || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(_, selectedDate) => {
            setShowPicker(Platform.OS === "ios");
            if (selectedDate) setBirthDate(selectedDate);
          }}
        />
      )}

      {/* 🔹 DropDownPicker — płeć */}
      <Text style={{ marginTop: 8, marginBottom: 4, fontWeight: "600" }}>
        Płeć:
      </Text>
      <DropDownPicker
        open={open}
        value={gender}
        items={items}
        setOpen={setOpen}
        setValue={setGender}
        setItems={setItems}
        placeholder="Wybierz płeć"
        style={{
          marginBottom: open ? 150 : 16,
          borderColor: "#ccc",
        }}
        dropDownContainerStyle={{ borderColor: "#ccc" }}
        zIndex={1000}
        zIndexInverse={1000}
        listMode="SCROLLVIEW"
      />

      {/* 🔹 Opis */}
      <TouchableOpacity
        onPress={() =>
          Alert.prompt("Opis", "Napisz coś o sobie", (text) =>
            setDescription(text || "")
          )
        }
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: description ? "#000" : "#777" }}>
          {description || "Dodaj krótki opis o sobie"}
        </Text>
      </TouchableOpacity>

      {/* 🔹 Przycisk */}
      <TouchableOpacity
        onPress={handleComplete}
        style={{
          backgroundColor: "#007AFF",
          paddingVertical: 14,
          borderRadius: 8,
        }}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
        >
          Zapisz i przejdź dalej
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CompleteRegistration;
