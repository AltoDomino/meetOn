import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  Modal,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import styles from "../../styles/Registration.styles";


interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
  gender: string;
  dateOfBirth: Date;
}

const Registration = () => {
  const handleBack = () => router.push("/(main)/Login");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const [open, setOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);

  const [items, setItems] = useState([
    { label: "Wybierz płeć", value: "" },
    { label: "Mężczyzna", value: "male" },
    { label: "Kobieta", value: "female" },
  ]);

  const onSubmit = async (dataReg: FormData) => {
    if (loading) return;

    // policz wiek
    const birthDate = new Date(dataReg.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // lekkie czyszczenie danych po stronie klienta (serwer i tak normalizuje)
    const finalData = {
      ...dataReg,
      userName: dataReg.userName.trim(),
      email: dataReg.email.trim().toLowerCase(),
      age,
    };

    try {
      setLoading(true);

      const res = await fetch("https://meeton-backend-ffmo.onrender.com/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(finalData),
      });

      // spróbuj JSON -> fallback na tekst
      let payload: any = null;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        payload = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => "");
        payload = text ? { message: text } : null;
      }
      const msg = payload?.message || "";

      if (res.status === 201) {
        Alert.alert("Sukces", msg || "Zostałeś zarejestrowany, email weryfikacyjny został wysłany!");
        // (opcjonalnie) automatyczny powrót do logowania:
        // router.replace("/(main)/Login");
      } else if (res.status === 409) {
        Alert.alert("Email już istnieje", msg || "Ten adres e-mail jest już zarejestrowany.");
        emailRef.current?.focus();
      } else if (res.status === 400) {
        Alert.alert("Błąd danych", msg || "Sprawdź wprowadzone dane.");
      } else {
        Alert.alert("Błąd", msg || "Coś poszło nie tak");
      }
    } catch (_error) {
      Alert.alert("Błąd", "Nie udało się połączyć z serwerem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback >
      <View style={{ flex: 1, backgroundColor: "#0d1a4d" }}>
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Image
            source={require("@/assets/images/ikonameeton.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.centeredContainer, { paddingBottom: 24 }]}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Nazwa użytkownika:</Text>
            <Controller
              control={control}
              name="userName"
              rules={{
                required: "Nazwa użytkownika jest wymagana",
                maxLength: { value: 8, message: "Login może mieć maksymalnie 8 znaków" },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, { color: "black" }]}
                  placeholder="Nazwa użytkownika"
                  placeholderTextColor="gray"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  editable={!loading}
                />
              )}
            />
            {errors.userName && <Text style={{ color: "red" }}>{errors.userName.message}</Text>}

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
                  ref={emailRef}
                  style={[styles.input, { color: "black" }]}
                  placeholder="Email"
                  placeholderTextColor="gray"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                  editable={!loading}
                />
              )}
            />
            {errors.email && <Text style={{ color: "red" }}>{errors.email.message}</Text>}

            <Text style={styles.label}>Hasło:</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Hasło jest wymagane",
                // zgodnie z backendem: min. 8 znaków + 1 duża litera + 1 cyfra
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                  message: "Hasło musi mieć min. 8 znaków, 1 dużą literę i 1 cyfrę",
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
                  editable={!loading}
                />
              )}
            />
            {errors.password && <Text style={{ color: "red" }}>{errors.password.message}</Text>}

            <Text style={styles.label}>Powtórz hasło:</Text>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: "Potwierdzenie hasła jest wymagane",
                validate: (value) => value === watch("password") || "Hasła muszą być identyczne",
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, { color: "black" }]}
                  placeholder="Powtórz hasło"
                  placeholderTextColor="gray"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  editable={!loading}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={{ color: "red" }}>{errors.confirmPassword.message}</Text>
            )}

            <Text style={styles.label}>Płeć:</Text>
            <Controller
              control={control}
              name="gender"
              rules={{ validate: (value) => value !== "" || "Wybór płci jest wymagany" }}
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
                  style={{ marginBottom: open ? 150 : 16, opacity: loading ? 0.6 : 1 }}
                  disabled={loading}
                  zIndex={1000}
                  zIndexInverse={1000}
                  listMode="SCROLLVIEW"
                />
              )}
            />
            {errors.gender && <Text style={{ color: "red" }}>{errors.gender.message}</Text>}

            <Text style={styles.label}>Data urodzenia:</Text>
            <Controller
              control={control}
              name="dateOfBirth"
              defaultValue={new Date(2000, 0, 1)}
              rules={{ required: "Data urodzenia jest wymagana" }}
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={[styles.input, { justifyContent: "center", opacity: loading ? 0.6 : 1 }]}
                    onPress={() => !loading && setShowDatePicker(true)}
                    disabled={loading}
                  >
                    <Text style={{ color: "black" }}>
                      {value ? value.toLocaleDateString() : "Wybierz datę urodzenia"}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={value || new Date(2000, 0, 1)}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) onChange(selectedDate);
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </>
              )}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>Rejestruję…</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>ZAREJESTRUJ</Text>
              )}
            </TouchableOpacity>

            <View style={styles.link}>
              <TouchableOpacity onPress={handleBack} disabled={loading}>
                <Text style={[styles.linkText, loading && { opacity: 0.6 }]}>
                  ← Wróć do logowania
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Modal transparent visible={loading} animationType="fade" statusBarTranslucent>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.35)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#0d1a4d",
                paddingHorizontal: 24,
                paddingVertical: 18,
                borderRadius: 14,
                alignItems: "center",
                minWidth: 200,
              }}
            >
              <ActivityIndicator size="large" color="#00A9F4" />
              <Text style={{ color: "#EAF6FF", marginTop: 12, fontWeight: "600" }}>
                Trwa rejestracja…
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Registration;
