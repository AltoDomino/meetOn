import { backend_URL } from "@/backendURL";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
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

// ✅ FEATURE FLAG: tymczasowo wyłączona weryfikacja telefonu
const ENABLE_PHONE_VERIFICATION = false;

// ✅ helper: z CLIENT ID robimy scheme com.googleusercontent.apps.<ID_BEZ_SUFFIX>
const googleClientIdToScheme = (clientId: string) => {
  const base = clientId.replace(".apps.googleusercontent.com", "");
  return `com.googleusercontent.apps.${base}`;
};

const Login = () => {
  const auth = useAuth();

  const {
    setUserName,
    setUserId,
    setAvatar,
    setDescription,
    setHasChosenActivities,
    setToken,
    setGender,
  } = auth;

  const { control, handleSubmit, watch } = useForm<FormData>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get("window").height;

  // ====== "ZAPOMNIAŁEŚ HASŁA?" ======
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);

  const openForgotModal = () => {
    if (loading) return;
    const currentEmail = (watch("email") || "").trim();
    setForgotEmail(currentEmail);
    setForgotVisible(true);
  };

  const submitForgotPassword = async () => {
    const email = forgotEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      Alert.alert("Błąd", "Podaj poprawny adres e-mail.");
      return;
    }

    const url = `${backend_URL}/api/login/forgot-password`;

    try {
      setForgotSending(true);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        Alert.alert("Błąd", "Nie udało się wysłać linku. Spróbuj ponownie.");
        return;
      }

      setForgotVisible(false);
      setForgotEmail("");

      Alert.alert(
        "Sprawdź skrzynkę",
        "Jeśli konto istnieje, wysłaliśmy link do zresetowania hasła.",
      );
    } catch {
      Alert.alert("Błąd połączenia", "Nie udało się połączyć z serwerem.");
    } finally {
      setForgotSending(false);
    }
  };

  // ====== ENV / BUILD ======
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    (Constants as any).executionEnvironment === "storeClient";

  useEffect(() => {
    // bez logów
  }, [isExpoGo]);

  /**
   * ✅ Redirect URI dla Google native
   * com.googleusercontent.apps.<ID>:/oauthredirect
   */
  const googleRedirectUri = useMemo(() => {
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!;
    const platformClientId =
      Platform.OS === "android" ? androidClientId : iosClientId;

    const scheme = googleClientIdToScheme(platformClientId);

    const uri = AuthSession.makeRedirectUri({
      native: `${scheme}:/oauthredirect`,
      preferLocalhost: false,
    });

    return uri;
  }, []);

  /**
   * ✅ ID TOKEN flow
   */
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
    redirectUri: googleRedirectUri,
  });

  // ====== BACKEND GOOGLE ======
  const loginWithGoogleOnBackend = async (idToken: string) => {
    try {
      setLoading(true);

      const res = await fetch(`${backend_URL}/api/login/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        Alert.alert("Błąd logowania (backend)", `Status: ${res.status}`);
        return;
      }

      const data = text ? JSON.parse(text) : {};
      await afterAuthSuccess(data, "google");
    } catch {
      Alert.alert("Błąd", "Nie udało się zalogować przez Google");
    } finally {
      setLoading(false);
    }
  };

  // ====== RESPONSE HANDLER (ID TOKEN) ======
  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const idToken =
        (response as any)?.authentication?.idToken ??
        (response as any)?.params?.id_token ??
        null;

      if (!idToken) {
        Alert.alert("Błąd", "Google nie zwróciło id_token.");
        return;
      }

      loginWithGoogleOnBackend(idToken);
      return;
    }

    if (response.type === "error") {
      Alert.alert("Błąd Google", "Google zwróciło błąd.");
      return;
    }

    if (response.type === "dismiss") {
      Alert.alert("Przerwano", "Użytkownik anulował logowanie");
      return;
    }
  }, [response]);

  // ====== APPLE LOGIN ======
  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
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

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        Alert.alert("Błąd logowania", "Nie udało się zweryfikować konta Apple");
        return;
      }

      const data = text ? JSON.parse(text) : {};
      await afterAuthSuccess(data, "apple");
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED" || err?.code === "CANCELED") return;
      Alert.alert("Błąd", "Nie udało się zalogować przez Apple");
    }
  };

  // ====== GENDER FALLBACK ======
  const fetchAndSetGenderIfMissing = async (userId: number, jwt?: string | null) => {
    try {
      const res = await fetch(`${backend_URL}/api/users/${userId}`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      });

      if (!res.ok) return;

      const profile = await res.json().catch(() => null);
      const g = normalizeGender(profile?.gender);
      await setGender(g);
    } catch {}
  };

  // ====== POST AUTH ======
  const afterAuthSuccess = async (data: any, provider: AuthProvider) => {
    try {
      const jwt = data?.token ?? null;
      const uid = data?.userId ?? null;

      await setToken(jwt);
      await setUserName(data?.userName ?? "");
      await setUserId(uid);

      await setAvatar(data?.avatar || data?.avatarUrl || null);
      await setDescription(data?.description || "");

      const gFromLogin = normalizeGender(data?.gender);
      await setGender(gFromLogin);

      if (!gFromLogin && uid) {
        await fetchAndSetGenderIfMissing(Number(uid), jwt);
      }

      const isPhoneVerified = data?.isPhoneVerified;

      // ✅ NORMALIZACJA isRegistrationComplete (żeby Apple/Google były spójne)
      const regRaw =
        data?.isRegistrationComplete ??
        data?.registrationComplete ??
        data?.is_complete ??
        null;

      const regComplete = regRaw === true || regRaw === "true" || regRaw === 1;

      if ((provider === "google" || provider === "apple") && !regComplete) {
        router.replace("/(main)/CompleteRegistration");
        return;
      }

      if (ENABLE_PHONE_VERIFICATION && isPhoneVerified === false) {
        router.replace("/(main)/PhoneVerification");
        return;
      }

      let hasActivities = false;

      try {
        const interestsRes = await fetch(`${backend_URL}/api/interests/${uid}`, {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
        });

        const interests = interestsRes.ok ? await interestsRes.json() : [];
        hasActivities = Array.isArray(interests) && interests.length > 0;
        await setHasChosenActivities(hasActivities);
      } catch {
        hasActivities = false;
        await setHasChosenActivities(false);
      }

      if (hasActivities) {
        router.replace("/(auth)/Event");
        return;
      }

      router.replace("/(main)/HomeScreen");
    } catch {
      Alert.alert("Błąd", "Nie udało się dokończyć logowania.");
    }
  };

  // ====== EMAIL/PASS LOGIN ======
  const onSubmit = async (dataLog: FormData) => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(`${backend_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataLog),
      });

      const text = await res.text().catch(() => "");

      if (!res.ok) {
        const msg = text || "";
        if (res.status === 422) Alert.alert("Błąd", "Nieprawidłowe dane logowania");
        else if (res.status === 401) Alert.alert("Błąd", "Niepoprawny email lub hasło");
        else if (res.status === 403)
          Alert.alert("Wymagana weryfikacja", "Zweryfikuj e-mail przed zalogowaniem.");
        else Alert.alert("Coś poszło nie tak", `Status: ${res.status}\n${msg}`);
        return;
      }

      const data = text ? JSON.parse(text) : {};
      await afterAuthSuccess(data, "email");
    } catch {
      Alert.alert("Błąd połączenia", "Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  // ====== GOOGLE LOGIN BUTTON ======
  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert("Chwileczkę", "Google login jeszcze się inicjalizuje.");
      return;
    }

    try {
      await (promptAsync as any)({ preferEphemeralSession: true });
    } catch {
      Alert.alert("Błąd", "Nie udało się uruchomić logowania Google.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("@/assets/images/meetOn.png")}
        style={[styles.background, { marginTop: -screenHeight * 0.3 }]}
        resizeMode="contain"
      >
        <View
          style={[
            styles.centeredContainer,
            { transform: [{ translateY: screenHeight * 0.05 }] },
          ]}
        >
          <View style={[styles.form]}>
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
              onPress={openForgotModal}
              disabled={loading}
              style={{ alignSelf: "center", marginTop: 6, marginBottom: 10 }}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#EAF6FF", fontWeight: "700" }}>
                Zapomniałeś hasła?
              </Text>
            </TouchableOpacity>

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
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
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
              <Text style={[styles.registerButtonText, loading && { opacity: 0.7 }]}>
                ZAREJESTRUJ SIĘ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ MODAL: Reset hasła */}
        <Modal
          transparent
          visible={forgotVisible}
          animationType="fade"
          onRequestClose={() => !forgotSending && setForgotVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => !forgotSending && setForgotVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.45)",
                justifyContent: "center",
                alignItems: "center",
                padding: 18,
              }}
            >
              <TouchableWithoutFeedback>
                <View
                  style={{
                    width: "100%",
                    maxWidth: 420,
                    backgroundColor: "#0d1a4d",
                    borderRadius: 16,
                    padding: 18,
                  }}
                >
                  <Text style={{ color: "#EAF6FF", fontSize: 18, fontWeight: "800" }}>
                    Reset hasła
                  </Text>

                  <Text style={{ color: "#EAF6FF", opacity: 0.9, marginTop: 8 }}>
                    Podaj e-mail. Wyślemy link do ustawienia nowego hasła.
                  </Text>

                  <View style={{ marginTop: 14 }}>
                    <Text style={{ color: "#EAF6FF", fontWeight: "700", marginBottom: 6 }}>
                      Email
                    </Text>

                    <TextInput
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      placeholder="email@domena.pl"
                      placeholderTextColor="rgba(255,255,255,0.55)"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!forgotSending}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: "#000",
                        opacity: forgotSending ? 0.7 : 1,
                      }}
                    />
                  </View>

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                    <TouchableOpacity
                      onPress={() => setForgotVisible(false)}
                      disabled={forgotSending}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(234,246,255,0.5)",
                        alignItems: "center",
                        opacity: forgotSending ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ color: "#EAF6FF", fontWeight: "800" }}>Anuluj</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={submitForgotPassword}
                      disabled={forgotSending}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: "#1E3A8A",
                        alignItems: "center",
                        opacity: forgotSending ? 0.7 : 1,
                      }}
                    >
                      {forgotSending ? (
                        <ActivityIndicator />
                      ) : (
                        <Text style={{ color: "#EAF6FF", fontWeight: "800" }}>
                          Wyślij link
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

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
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={{ color: "#EAF6FF", marginTop: 12, fontWeight: "600" }}>
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
