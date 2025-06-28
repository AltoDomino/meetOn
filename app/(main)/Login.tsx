import { loadActivities } from "@/utilis/activityStoarage";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Login.styles";
import { HelloWave } from "@/components/HelloWave";

interface FormData {
  userName: string;
  email: string;
  password: string;
}

const Login = () => {
  const { setUserName, setUserId } = useAuth();
  const { control, handleSubmit } = useForm<FormData>();
  const router = useRouter();

  const onSubmit = async (dataLog: FormData) => {
    try {
      const res = await fetch("http://192.168.1.26:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataLog),
      });

      if (res.status === 200) {
        const data = await res.json();
        setUserName(data.userName);
        setUserId(data.userId);
        const storedActivities = await loadActivities(data.userName);

        if (storedActivities.length > 0) {
          router.replace("/(auth)/Event");
        } else {
          router.replace("/(main)/HomeScreen");
        }
      } else if (res.status === 422) {
        Alert.alert("Błąd");
      } else {
        Alert.alert("Coś poszło nie tak", `Status: ${res.status}`);
      }
    } catch (error) {
      Alert.alert("Błąd połączenia", "Nie udało połączyć z serwerem.");
      console.log(error, "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("@/assets/images/meetOn.png")}
          style={styles.reactLogo}
        />

        <View style={styles.form}>
          <Text style={styles.label}>Email:</Text>
          <Controller
            control={control}
            name="email"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
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
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoCapitalize="none"
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
