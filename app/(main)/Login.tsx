import { backend_URL } from "@/backendURL";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/Login.styles";

WebBrowser.maybeCompleteAuthSession(); // ✅ obsługa powrotu z Google

interface FormData {
  email: string;
  password: string;
}

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
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get("window").height;

  const redirectUri =
    Platform.select({
      android: "meeton:/oauth2redirect/google",
      ios: "meeton:/oauth2redirect/google",
    }) || "meeton:/oauth2redirect/google";

  console.log("✅ Używany redirectUri:", redirectUri);

  // ✅ Google Auth konfiguracja
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    responseType: "id_token",
    redirectUri,
    selectAccount: true,
  });

  // ✅ obsługa odpowiedzi Google
  useEffect(() => {
    if (!response) return;

    console.log("🔍 Google Auth Response:", JSON.stringify(response, null, 2));

    if (response.type === "success" && response.authentication?.idToken) {
      loginWithGoogleOnBackend(response.authentication.idToken);
    } else if (response.type === "dismiss") {
      Alert.alert("Przerwano", "Użytkownik anulował logowanie");
    } else {
      Alert.alert("Błąd", "Nie udało się pobrać tokenu Google");
    }
  }, [response]);

  const loginWithGoogleOnBackend = async (idToken: string) => {
    try {
      setLoading(true);

      const res = await fetch(`${backend_URL}/api/login/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.log("❌ Backend Google error:", errText);
        Alert.alert("Błąd logowania", "Google zwróciło błąd.");
        return;
      }

      const data = await res.json();
      await afterAuthSuccess(data);
    } catch (e) {
      console.error("❌ Google backend error:", e);
      Alert.alert("Błąd", "Nie udało się zalogować przez Google");
    } finally {
      setLoading(false);
    }
  };
  // ✅ APPLE LOGIN
  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert("Błąd", "Apple nie zwróciło tokenu");
        return;
      }

      const res = await fetch(`${backend_URL}/api/login/apple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: credential.identityToken }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => "");
        console.log("❌ Backend Apple error:", err);
        Alert.alert("Błąd logowania", "Nie udało się zweryfikować konta Apple");
        return;
      }

      const data = await res.json();
      await afterAuthSuccess(data);
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED") return;
      console.error("❌ Apple login failed:", err);
      Alert.alert("Błąd", "Nie udało się zalogować przez Apple");
    }
  };

  const afterAuthSuccess = async (data: any) => {
    try {
      await setToken(data.token ?? null);
      await setUserName(data.userName);
      await setUserId(data.userId);
      await setAvatar(data.avatar || null);
      await setDescription(data.description || "");

      const interestsRes = await fetch(
        `${backend_URL}/api/interests/${data.userId}`,
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

      if (!data.isPhoneVerified) {
        router.replace("/(main)/PhoneVerification");
      } else if (!data.isRegistrationComplete) {
        router.replace("/(main)/CompleteRegistration");
      } else {
        router.replace("/(main)/HomeScreen");
      }
    } catch (e) {
      console.log("❌ Błąd afterAuthSuccess:", e);
      Alert.alert("Błąd", "Nie udało się dokończyć logowania.");
    }
  };

  // ✅ Login ręczny email + hasło
  const onSubmit = async (dataLog: FormData) => {
    if (loading) return;
    try {
      setLoading(true);

      const res = await fetch(`${backend_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataLog),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        if (res.status === 422)
          Alert.alert("Błąd", "Nieprawidłowe dane logowania");
        else if (res.status === 401)
          Alert.alert("Błąd", "Niepoprawny email lub hasło");
        else if (res.status === 403)
          Alert.alert(
            "Wymagana weryfikacja",
            "Zweryfikuj e-mail przed zalogowaniem."
          );
        else Alert.alert("Coś poszło nie tak", `Status: ${res.status}\n${msg}`);
        return;
      }

      const data = await res.json();
      await afterAuthSuccess(data);
    } catch (error) {
      console.log("❌ Login email error:", error);
      Alert.alert("Błąd połączenia", "Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ przycisk Google — tylko wywołuje promptAsync
  const handleGoogleLogin = async () => {
    await promptAsync();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("@/assets/images/meetOn.png")}
        style={[styles.background, { marginTop: -screenHeight * 0.3 }]}
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

            {/* GOOGLE LOGIN */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              style={{
                marginTop: 16,
                backgroundColor: "#fff",
                paddingVertical: 12,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <Image
                source={require("../../assets/images/google.png")}
                style={{ width: 22, height: 22, marginRight: 8 }}
                resizeMode="contain"
              />
              <Text style={{ color: "#000", fontWeight: "600", fontSize: 16 }}>
                Zaloguj się przez Google
              </Text>
            </TouchableOpacity>

            {/* APPLE LOGIN */}
            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={handleAppleLogin}
                style={{
                  marginTop: 12,
                  backgroundColor: "#000",
                  paddingVertical: 12,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <Image
                  source={require("../../assets/images/apple.png")}
                  style={{
                    width: 22,
                    height: 22,
                    marginRight: 8,
                    tintColor: "#fff",
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                >
                  Zaloguj się przez Apple
                </Text>
              </TouchableOpacity>
            )}

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

        {/* LOADER */}
        <Modal transparent visible={loading} animationType="fade">
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
