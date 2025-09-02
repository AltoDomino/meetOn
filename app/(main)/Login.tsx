// login.tsx
import { loadActivities } from "../../utilis/activityStoarage";
import { useRouter } from "expo-router";
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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/Login.styles";

/* ➕ AUTH PROVIDERS */
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

interface FormData {
  email: string;
  password: string;
}

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

/** ─────────────────────────────────────────────────────────────
 *  Bezpieczny przycisk Google
 *  ──────────────────────────────────────────────────────────── */
const googleIcon = require("@/assets/images/google.png");

function GoogleButton({
  disabled,
  onToken,
}: {
  disabled?: boolean;
  onToken: (idToken: string) => void;
}) {
  const iosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (
    (Platform.OS === "ios" && !iosId) ||
    (Platform.OS === "android" && !androidId)
  ) {
    return null;
  }

  const config =
    Platform.OS === "ios"
      ? { iosClientId: iosId! }
      : Platform.OS === "android"
      ? { androidClientId: androidId! }
      : webId
      ? { webClientId: webId }
      : {};

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  useEffect(() => {
    if (response?.type === "success") {
      const idToken =
        (response as any)?.params?.id_token ??
        (response as any)?.authentication?.idToken;
      if (idToken) onToken(idToken);
    }
  }, [response, onToken]);

  return (
    <TouchableOpacity
      style={[
        styles.socialBtn,
        styles.googleBtn,
        (!request || disabled) && { opacity: 0.6 },
      ]}
      disabled={!request || disabled}
      onPress={() => promptAsync()}
      activeOpacity={0.85}
    >
      <View style={g.row}>
        <Image
          source={googleIcon}
          style={[g.icon, { marginRight: 8 }]}
          resizeMode="contain"
        />
        <Text style={styles.googleText}>Kontynuuj z Google</Text>
      </View>
    </TouchableOpacity>
  );
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
  const screenHeight = Dimensions.get("window").height;
  const [loading, setLoading] = useState(false);

  /* ➕ Apple Sign-In dostępny (iOS) */
  const [appleAvailable, setAppleAvailable] = useState(false);
  useEffect(() => {
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  /* 🔁 wspólna post-autoryzacja */
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

  /* ▶️ Apple */
  const handleApplePress = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert("Błąd", "Brak identityToken od Apple.");
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/login/apple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential.identityToken }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        Alert.alert(
          "Logowanie Apple nie powiodło się",
          msg || `HTTP ${res.status}`
        );
        return;
      }

      const data = await res.json();
      await afterAuthSuccess(data);
    } catch (e: any) {
      if (e?.code === "ERR_CANCELED") return; // użytkownik anulował
      console.log("Apple login error:", e);
      Alert.alert("Błąd", "Nie udało się zalogować przez Apple.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("@/assets/images/meetOn.png")}
        style={[styles.background, { marginTop: -screenHeight * 0.4 }]}
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

            {/* ───────── separator ───────── */}
            <View style={styles.separatorRow}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>lub</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* ───────── social buttons ───────── */}
            <View style={styles.socialColumn}>
              <GoogleButton
                disabled={loading}
                onToken={async (idToken) => {
                  try {
                    setLoading(true);
                    const res = await fetch(`${BACKEND_URL}/api/login/google`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ idToken }),
                    });
                    if (!res.ok) {
                      const msg = await res.text().catch(() => "");
                      Alert.alert(
                        "Logowanie Google nie powiodło się",
                        msg || `HTTP ${res.status}`
                      );
                      return;
                    }
                    const data = await res.json();
                    await afterAuthSuccess(data);
                  } catch (e) {
                    console.log("Google login error:", e);
                    Alert.alert(
                      "Błąd",
                      "Nie udało się zalogować przez Google."
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
              />

              {/* Apple (iOS) */}
              {Platform.OS === "ios" && appleAvailable && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={
                    AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                  }
                  buttonStyle={
                    AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                  }
                  cornerRadius={8}
                  style={styles.appleBtn}
                  onPress={handleApplePress}
                />
              )}
            </View>
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


const g = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
  },
  icon: {
    width: 24,
    height: 24,
  },
});

