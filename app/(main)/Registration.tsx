import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "../../styles/Registration.styles";

interface FormData {
  email: string;
  password: string;
  userName: string;
  gender: string;
  dateOfBirth: Date;
}

const Registration = () => {
  const handleBack = () => router.push("/(main)/Login");
  const { control, handleSubmit } = useForm<FormData>();
  const [open, setOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [items, setItems] = useState([
    { label: "Mężczyzna", value: "male" },
    { label: "Kobieta", value: "female" },
  ]);

  const onSubmit = async (dataReg: FormData) => {
    const birthDate = new Date(dataReg.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const finalData = {
      ...dataReg,
      age,
    };

    try {
      const res = await fetch("http://192.168.1.26:3000/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      if (res.status === 201) {
        Alert.alert("Sukces", "Dane wysłane");
      } else if (res.status === 403) {
        Alert.alert("Błąd", "Niepoprawne dane");
      }
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={require("@/assets/images/meetOn.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Nazwa użytkownika:</Text>
            <Controller
              control={control}
              name="userName"
              rules={{ required: "Nazwa użytkownika jest wymagana" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Nazwa użytkownika"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                />
              )}
            />

            <Text style={styles.label}>Email:</Text>
            <Controller
              control={control}
              name="email"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            <Text style={styles.label}>Hasło:</Text>
            <Controller
              control={control}
              name="password"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Hasło"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            <Text style={styles.label}>Płeć:</Text>
            <Controller
              control={control}
              name="gender"
              rules={{ required: "Wybór płci jest wymagany" }}
              render={({ field: { onChange, value } }) => (
                <DropDownPicker
                  open={open}
                  setOpen={setOpen}
                  value={value}
                  setValue={(callback) => {
                    const newValue = callback(value);
                    onChange(newValue);
                  }}
                  items={items}
                  setItems={setItems}
                  placeholder="Wybierz płeć"
                  style={{ marginBottom: open ? 150 : 16 }}
                />
              )}
            />

            <Text style={styles.label}>Data urodzenia:</Text>
            <Controller
              control={control}
              name="dateOfBirth"
              defaultValue={new Date(2000, 0, 1)}
              rules={{ required: "Data urodzenia jest wymagana" }}
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={[styles.input, { justifyContent: "center" }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text>
                      {value
                        ? value.toLocaleDateString()
                        : "Wybierz datę urodzenia"}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={value || new Date(2000, 0, 1)}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          onChange(selectedDate);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </>
              )}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>ZAREJESTRUJ</Text>
            </TouchableOpacity>

            <View style={styles.link}>
              <TouchableOpacity onPress={handleBack}>
                <Text style={styles.linkText}>← Wróć do logowania</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default Registration;
