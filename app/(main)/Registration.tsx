import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  ImageBackground,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [open, setOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [items, setItems] = useState([
    { label: "Wybierz płeć", value: "" },
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
      const res = await fetch(
        "https://meeton-backend-ffmo.onrender.com/api/registration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        }
      );
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#0d1a4d" }}>
        <ImageBackground
          source={require("@/assets/images/ikonameeton.png")}
          style={{
            width: "100%",
            height: 200,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0d1a4d",
          }}
          resizeMode="contain"
        />

        <View style={[styles.centeredContainer, { paddingBottom: 24 }]}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Nazwa użytkownika:</Text>
            <Controller
              control={control}
              name="userName"
              rules={{
                required: "Nazwa użytkownika jest wymagana",
                maxLength: {
                  value: 8,
                  message: "Login może mieć maksymalnie 8 znaków",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, { color: "black" }]}
                  placeholder="Nazwa użytkownika"
                  placeholderTextColor="gray"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                />
              )}
            />
            {errors.userName && (
              <Text style={{ color: "red" }}>{errors.userName.message}</Text>
            )}

            <Text style={styles.label}>Email:</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email jest wymagany",
                pattern: {
                  value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                  message: "Nieprawidłowy adres email",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, { color: "black" }]}
                  placeholder="Email"
                  placeholderTextColor="gray"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text style={{ color: "red" }}>{errors.email.message}</Text>
            )}

            <Text style={styles.label}>Hasło:</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Hasło jest wymagane",
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d).+$/,
                  message: "Hasło musi zawierać dużą literę i cyfrę",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, { color: "black" }]}
                  placeholder="Hasło"
                  placeholderTextColor="gray"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text style={{ color: "red" }}>{errors.password.message}</Text>
            )}

            <Text style={styles.label}>Płeć:</Text>
            <Controller
              control={control}
              name="gender"
              rules={{
                validate: (value) =>
                  value !== "" || "Wybór płci jest wymagany",
              }}
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
                  zIndex={1000}
                  zIndexInverse={1000}
                  listMode="SCROLLVIEW"
                />
              )}
            />
            {errors.gender && (
              <Text style={{ color: "red" }}>{errors.gender.message}</Text>
            )}

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
                    <Text style={{ color: "black" }}>
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Registration;
