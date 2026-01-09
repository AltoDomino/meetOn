import { backend_URL } from "@/backendURL";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useState } from "react";
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

WebBrowser.maybeCompleteAuthSession();

interface FormData {
  email: string;
  password: string;
}

type AuthProvider = "email" | "google" | "apple";
type Gender = "female" | "male" | "other" | null;

const normalizeGender = (g: any): Gender => {
  if (!g) return null;
  const v = String(g).trim().toLowerCase();
  if (v === "female" || v === "f" || v === "kobieta") return "female";
  if (v === "male" || v === "m" || v === "mezczyzna" || v === "mężczyzna")
    return "male";
  if (v === "other" || v === "inne") return "other";
  return null;
};

const Login = () => {
  const {
    setUserName,
    setUserId,
    setAvatar,
    setDescription,
    setHasChosenActivities,
    setToken,
    setGender,
    token,
  } = useAuth();

  const { control, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get("window").height;

  const redirectUri = useMemo(
    () =>
      Platform.select({
        android: "meeton:/oauth2redirect/google",
        ios: "meeton:/oauth2redirect/google",
      }) || "meeton:/oauth2redirect/google",
    []
  );

  console.log("✅ Używany redirectUri:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    responseType: "id_token",
    redirectUri,
    selectAccount: true,
  });

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

  const fetchAndSetGenderIfMissing = async (
    userId: number,
    jwt?: string | null
  ) => {
    try {
      const res = await fetch(`${backend_URL}/api/users/${userId}`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.log("⚠️ Nie udało się pobrać profilu usera:", res.status, t);
        return;
      }

      const profile = await res.json();
      console.log("✅ Profil usera:", profile);

      const g = normalizeGender(profile?.gender);
      await setGender(g);
      console.log("✅ setGender z profilu:", g);
    } catch (e) {
      console.log("⚠️ fetchAndSetGenderIfMissing error:", e);
    }
  };

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
      await afterAuthSuccess(data, "google");
    } catch (e) {
      console.error("❌ Google backend error:", e);
      Alert.alert("Błąd", "Nie udało się zalogować przez Google");
    } finally {
      setLoading(false);
    }
  };

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
      await afterAuthSuccess(data, "apple");
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED") return;
      console.error("❌ Apple login failed:", err);
      Alert.alert("Błąd", "Nie udało się zalogować przez Apple");
    }
  };

const afterAuthSuccess = async (data: any, provider: AuthProvider) => {
  try {
    console.log("✅ afterAuthSuccess provider:", provider);
    console.log("✅ afterAuthSuccess payload:", data);

    const jwt = data.token ?? null;
    const uid = data.userId ?? null;

    await setToken(jwt);
    await setUserName(data.userName ?? "");
    await setUserId(uid);
    await setAvatar(data.avatar || null);
    await setDescription(data.description || "");

    // ✅ PŁEĆ
    const gFromLogin = normalizeGender(data?.gender);
    await setGender(gFromLogin);
    console.log("✅ setGender z login payload:", gFromLogin);

    if (!gFromLogin && uid) {
      await fetchAndSetGenderIfMissing(Number(uid), jwt);
    }

    // ✅ FLAGS (z backendu)
    const isPhoneVerified = data?.isPhoneVerified; // boolean
    const isRegistrationComplete = data?.isRegistrationComplete; // boolean

    console.log("✅ Flags from backend:", {
      isPhoneVerified,
      isRegistrationComplete,
    });

    // ✅ 1) GOOGLE / APPLE: najpierw CompleteRegistration, potem PhoneVerification
    if ((provider === "google" || provider === "apple") && isRegistrationComplete === false) {
      router.replace("/(main)/CompleteRegistration");
      return;
    }

    // ✅ 2) EMAIL/hasło (po “fizycznej” rejestracji): ma przejść przez PhoneVerification
    // ✅ oraz ogólnie każdy kto nie ma zweryfikowanego telefonu -> PhoneVerification
    if (isPhoneVerified === false) {
      router.replace("/(main)/PhoneVerification");
      return;
    }

    // ✅ 3) INTERESTS / AKTYWNOŚCI
    // dopiero po tym jak user ma komplet profilu i zweryfikowany telefon
    let hasActivities = false;

    try {
      const interestsRes = await fetch(`${backend_URL}/api/interests/${uid}`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      });

      const interests = interestsRes.ok ? await interestsRes.json() : [];
      hasActivities = Array.isArray(interests) && interests.length > 0;

      await setHasChosenActivities(hasActivities);

      console.log("✅ interests length:", Array.isArray(interests) ? interests.length : "not array");
    } catch (e) {
      console.log("⚠️ interests fetch failed:", e);
      // nie blokuj logowania – fallback na Home lub Activity
      hasActivities = false;
      await setHasChosenActivities(false);
    }

    if (hasActivities) {
      router.replace("/(auth)/Event");
      return;
    }

    // jeśli nie ma aktywności, ale jest zweryfikowany -> Activity selection
    router.replace("/(main)/HomeScreen"); // <-- ekran wyboru aktywności
    return;

  } catch (e) {
    console.log("❌ Błąd afterAuthSuccess:", e);
    Alert.alert("Błąd", "Nie udało się dokończyć logowania.");
  }
};


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
      await afterAuthSuccess(data, "email");
    } catch (error) {
      console.log("❌ Login email error:", error);
      Alert.alert("Błąd połączenia", "Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert("Chwileczkę", "Google login jeszcze się inicjalizuje.");
      return;
    }
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

            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
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
                opacity: loading ? 0.7 : 1,
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

            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={handleAppleLogin}
                disabled={loading}
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
                  opacity: loading ? 0.7 : 1,
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
