import { loadActivities } from "@/utilis/activityStoarage";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/Login.styles";

interface FormData {
  userName: string;
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
  } = useAuth();

  const { control, handleSubmit } = useForm<FormData>();
  const router = useRouter();
    const screenHeight = Dimensions.get("window").height;
  const onSubmit = async (dataLog: FormData) => {

    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataLog),
      });

      if (res.status === 200) {
        const data = await res.json();

        await setUserName(data.userName);
        await setUserId(data.userId);
        await setAvatar(data.avatar || null);
        await setDescription(data.description || "");

        const interestsRes = await fetch(
          `${BACKEND_URL}/api/interests/${data.userId}`
        );
        const interests = await interestsRes.json();

        if (interests && interests.length > 0) {
          await setHasChosenActivities(true);
        }

        const storedActivities = await loadActivities(data.userName);

        if (storedActivities.length > 0) {
          router.replace("/(auth)/Event");
        } else {
          router.replace("/(main)/HomeScreen");
        }
      } else if (res.status === 422) {
        Alert.alert("Błąd", "Nieprawidłowe dane logowania");
      } else {
        Alert.alert("Coś poszło nie tak", `Status: ${res.status}`);
      }
    } catch (error) {
      Alert.alert("Błąd połączenia", "Nie udało się połączyć z serwerem.");
      console.log(error, "error");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("@/assets/images/meetOn.png")}
        style={[styles.background, { marginTop: -screenHeight * 0.08 }]}
        resizeMode="cover"
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
                  style={[styles.input, { color: "black" }]}
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="gray"
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
                  style={[styles.input, { color: "black" }]}
                  placeholder="Hasło"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor="gray"
                />
              )}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.loginButtonText}>ZALOGUJ SIĘ</Text>
            </TouchableOpacity>

            <Text style={styles.noAccountText}>Nie masz konta?</Text>

            <TouchableOpacity
              onPress={() => router.replace("./Registration")}
              style={styles.registerButton}
            >
              <Text style={styles.registerButtonText}>ZAREJESTRUJ SIĘ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

export default Login;
