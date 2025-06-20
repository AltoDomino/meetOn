import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import styles from "../styles/Login.styles";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

interface FormData {
  userName: string;
  email: string;
  password: string;
}

const Login = () => {
  const { setUserName } = useAuth();
  const { control, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const onSubmit = async (dataLog: FormData) => {
    try {
      const res = await fetch("http://192.168.1.26:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataLog), // Przekazanie danych logowania
      });

      if (res.status === 200) {
        const data = await res.json();
        setUserName(data.userName);
        router.replace({
          pathname: "/(auth)/DrawerWrapper",
        });
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
    <View style={styles.container}>
      <Text>Email:</Text>
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

      <Text>Password:</Text>
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

      <Button title="ZALOGUJ SIĘ" onPress={handleSubmit(onSubmit)} />
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Nie masz konta?</Text>
        <TouchableOpacity
          onPress={() => router.replace("./Registration")}
          style={{
            backgroundColor: "#007bff",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            ZAREJESTRUJ SIĘ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
