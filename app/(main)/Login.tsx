import { loadActivities } from "../../utilis/activityStoarage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/Login.styles";

interface FormData {
  email: string;
  password: string;
}

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

const Login = () => {
  const {
    setUserName,
    setUserId,
    setAvatar,
    setDescription,
    setHasChosenActivities,
    setToken,
  } = useAuth();

  const { control, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const screenHeight = Dimensions.get("window").height;
  const [loading, setLoading] = useState(false);

  const afterAuthSuccess = async (data: any) => {
    await setToken(data.token ?? null);
    await setUserName(data.userName);
    await setUserId(data.userId);
    await setAvatar(data.avatar || null);
    await setDescription(data.description || "");

    const interestsRes = await fetch(
      `${BACKEND_URL}/api/interests/${data.userId}`,
      {
        headers: data.token
          ? { Authorization: `Bearer ${data.token}` }
          : undefined,
      }
    );
    const interests = interestsRes.ok ? await interestsRes.json() : [];
    if (Array.isArray(interests) && interests.length > 0) {
      await setHasChosenActivities(true);
    }

    const storedActivities = await loadActivities(data.userName);
    if (storedActivities.length > 0) {
      router.replace("/(auth)/Event");
    } else {
      router.replace("/(main)/HomeScreen");
    }
  };

  /* 🔐 klasyczny submit */
  const onSubmit = async (dataLog: FormData) => {
    if (loading) return;
    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataLog),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        if (res.status === 422) {
          Alert.alert("Błąd", "Nieprawidłowe dane logowania");
        } else if (res.status === 401) {
          Alert.alert("Błąd", "Niepoprawny email lub hasło");
        } else if (res.status === 403) {
          Alert.alert(
            "Wymagana weryfikacja",
            "Zweryfikuj e-mail przed zalogowaniem."
          );
        } else {
          Alert.alert("Coś poszło nie tak", `Status: ${res.status}\n${msg}`);
        }
        return;
      }

      const data = await res.json();
      await afterAuthSuccess(data);
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert("Błąd połączenia", "Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("@/assets/images/meetOn.png")}
        style={[styles.background, { marginTop: -screenHeight * 0.2 }]}
        resizeMode="contain"
      >
        <View style={styles.centeredContainer}>
          <View style={styles.form}>
            <Text style={styles.label}>Email:</Text>
            <Controller
              control={control}
              name="email"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    { color: "black", opacity: loading ? 0.6 : 1 },
                  ]}
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="gray"
                  editable={!loading}
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
                  style={[
                    styles.input,
                    { color: "black", opacity: loading ? 0.6 : 1 },
                  ]}
                  placeholder="Hasło"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor="gray"
                  editable={!loading}
                />
              )}
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>ZALOGUJ SIĘ</Text>
            </TouchableOpacity>

            <Text style={styles.noAccountText}>Nie masz konta?</Text>

            <TouchableOpacity
              onPress={() => !loading && router.replace("./Registration")}
              style={styles.registerButton}
              disabled={loading}
            >
              <Text
                style={[styles.registerButtonText, loading && { opacity: 0.7 }]}
              >
                ZAREJESTRUJ SIĘ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Overlay z loaderem */}
        <Modal
          transparent
          visible={loading}
          animationType="fade"
          statusBarTranslucent
        >
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
              <Text
                style={{ color: "#EAF6FF", marginTop: 12, fontWeight: "600" }}
              >
                Trwa logowanie…
              </Text>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

export default Login;
