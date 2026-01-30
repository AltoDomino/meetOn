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

// ====== DEBUG HELPERS ======
const now = () => new Date().toISOString();

const mask = (val?: string | null, keep = 18) => {
  if (!val) return null;
  if (val.length <= keep) return `${val}…`;
  return `${val.slice(0, keep)}…(${val.length} chars)`;
};

const safeJson = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

const logSection = (title: string, payload?: any) => {
  // eslint-disable-next-line no-console
  console.log(`\n================ ${title} ================\n`);
  if (payload !== undefined) {
    // eslint-disable-next-line no-console
    console.log(payload);
  }
  // eslint-disable-next-line no-console
  console.log(`\n================ END ${title} ================\n`);
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

      logSection("FORGOT PASSWORD / REQUEST", {
        time: now(),
        endpoint: url,
        email,
      });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await res.text().catch(() => "");
      logSection("FORGOT PASSWORD / RESPONSE", {
        time: now(),
        status: res.status,
        ok: res.ok,
        bodyText: text?.slice(0, 2000),
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
    } catch (e) {
      logSection("FORGOT PASSWORD / ERROR", e);
      Alert.alert("Błąd połączenia", "Nie udało się połączyć z serwerem.");
    } finally {
      setForgotSending(false);
    }
  };

  // ====== ENV / BUILD DEBUG ======
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    (Constants as any).executionEnvironment === "storeClient";

  const buildInfo = useMemo(
    () => ({
      time: now(),
      platform: Platform.OS,
      isExpoGo,
      appOwnership: Constants.appOwnership,
      executionEnvironment: (Constants as any)?.executionEnvironment,
      schemeFromConfig: (Constants as any)?.expoConfig?.scheme,
      androidPackage: (Constants as any)?.expoConfig?.android?.package,
      iosBundleId: (Constants as any)?.expoConfig?.ios?.bundleIdentifier,
      owner: (Constants as any)?.expoConfig?.owner,
      slug: (Constants as any)?.expoConfig?.slug,
      version: (Constants as any)?.expoConfig?.version,
    }),
    [isExpoGo],
  );

  useEffect(() => {
    logSection("APP / BUILD INFO", buildInfo);
  }, [buildInfo]);

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

    logSection("GOOGLE DEBUG / REDIRECT URI (native)", {
      time: now(),
      platform: Platform.OS,
      platformClientId: mask(platformClientId),
      scheme,
      redirectUri: uri,
      expectedPattern: `${scheme}:/oauthredirect`,
    });

    return uri;
  }, []);

  /**
   * ✅ Najważniejsza zmiana:
   * zamiast code+exchange, prosimy od razu o ID TOKEN (bez token exchange)
   */
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
    redirectUri: googleRedirectUri,
  });

  useEffect(() => {
    logSection("GOOGLE DEBUG / REQUEST OBJECT (ID TOKEN FLOW)", {
      time: now(),
      requestExists: !!request,
      requestUrl: (request as any)?.url ?? null,
      requestClientId: mask((request as any)?.clientId ?? null),
      requestRedirectUri: (request as any)?.redirectUri ?? null,
    });
  }, [request]);

  // ====== BACKEND GOOGLE ======
  const loginWithGoogleOnBackend = async (idToken: string) => {
    try {
      setLoading(true);

      logSection("GOOGLE DEBUG / SENDING ID_TOKEN TO BACKEND", {
        time: now(),
        endpoint: `${backend_URL}/api/login/google`,
        idToken: mask(idToken),
      });

      const res = await fetch(`${backend_URL}/api/login/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      const text = await res.text().catch(() => "");
      logSection("GOOGLE DEBUG / BACKEND RAW RESPONSE", {
        time: now(),
        status: res.status,
        ok: res.ok,
        bodyText: text?.slice(0, 2000),
      });

      if (!res.ok) {
        Alert.alert(
          "Błąd logowania (backend)",
          `Status: ${res.status}\nZobacz logi w konsoli.`,
        );
        return;
      }

      const data = text ? JSON.parse(text) : {};
      logSection("GOOGLE DEBUG / BACKEND PARSED JSON", data);

      await afterAuthSuccess(data, "google");
    } catch (e) {
      console.error("❌ Google backend error:", e);
      Alert.alert("Błąd", "Nie udało się zalogować przez Google");
    } finally {
      setLoading(false);
    }
  };

  // ====== RESPONSE HANDLER (ID TOKEN) ======
  useEffect(() => {
    if (!response) return;

    logSection("GOOGLE DEBUG / RAW RESPONSE (FULL)", safeJson(response));

    if (response.type === "success") {
      // w tym flow token dostajesz od razu:
      const idToken =
        (response as any)?.authentication?.idToken ??
        (response as any)?.params?.id_token ??
        null;

      logSection("GOOGLE DEBUG / SUCCESS (ID TOKEN FLOW)", {
        time: now(),
        hasAuth: !!(response as any)?.authentication,
        idToken: mask(idToken),
      });

      if (!idToken) {
        Alert.alert("Błąd", "Google nie zwróciło id_token (sprawdź logi).");
        return;
      }

      loginWithGoogleOnBackend(idToken);
      return;
    }

    if (response.type === "error") {
      logSection("GOOGLE DEBUG / ERROR DETAILS", {
        time: now(),
        error: (response as any).error,
        errorCode: (response as any).error?.code,
        errorDesc: (response as any).error?.description,
        params: (response as any).params,
      });

      Alert.alert("Błąd Google", "Google zwróciło błąd. Sprawdź logi w konsoli.");
      return;
    }

    if (response.type === "dismiss") {
      logSection("GOOGLE DEBUG / DISMISSED", { time: now() });
      Alert.alert("Przerwano", "Użytkownik anulował logowanie");
      return;
    }
  }, [response]);

  // ====== APPLE LOGIN ======
  const handleAppleLogin = async () => {
    try {
      logSection("APPLE DEBUG / START", { time: now() });

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      logSection("APPLE DEBUG / CREDENTIAL", {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        authorizationCode: mask(credential.authorizationCode),
        identityToken: mask(credential.identityToken),
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
      logSection("APPLE DEBUG / BACKEND RAW RESPONSE", {
        time: now(),
        status: res.status,
        ok: res.ok,
        bodyText: text?.slice(0, 2000),
      });

      if (!res.ok) {
        Alert.alert("Błąd logowania", "Nie udało się zweryfikować konta Apple");
        return;
      }

      const data = text ? JSON.parse(text) : {};
      logSection("APPLE DEBUG / BACKEND PARSED JSON", data);

      await afterAuthSuccess(data, "apple");
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED" || err?.code === "CANCELED") return;
      console.error("❌ Apple login failed:", err);
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

      const text = await res.text().catch(() => "");
      const profile = text ? JSON.parse(text) : {};
      const g = normalizeGender(profile?.gender);
      await setGender(g);
    } catch {}
  };

  // ====== POST AUTH ======
  const afterAuthSuccess = async (data: any, provider: AuthProvider) => {
    try {
      const jwt = data.token ?? null;
      const uid = data.userId ?? null;

      await setToken(jwt);
      await setUserName(data.userName ?? "");
      await setUserId(uid);

      await setAvatar(data.avatar || data.avatarUrl || null);
      await setDescription(data.description || "");

      const gFromLogin = normalizeGender(data?.gender);
      await setGender(gFromLogin);

      if (!gFromLogin && uid) {
        await fetchAndSetGenderIfMissing(Number(uid), jwt);
      }

      const isPhoneVerified = data?.isPhoneVerified;
      const isRegistrationComplete = data?.isRegistrationComplete;

      if (
        (provider === "google" || provider === "apple") &&
        isRegistrationComplete === false
      ) {
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
    } catch (e) {
      logSection("AUTH DEBUG / afterAuthSuccess ERROR", e);
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
      logSection("EMAIL LOGIN / BACKEND RAW", {
        time: now(),
        status: res.status,
        ok: res.ok,
        bodyText: text?.slice(0, 2000),
      });

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
      logSection("EMAIL LOGIN / BACKEND PARSED", data);

      await afterAuthSuccess(data, "email");
    } catch (error) {
      console.log("❌ Login email error:", error);
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

    console.log("GOOGLE request url:", (request as any)?.url);
    console.log("request.clientId:", (request as any)?.clientId);
    console.log("request.redirectUri:", (request as any)?.redirectUri);

    logSection("GOOGLE DEBUG / PROMPT ASYNC START", {
      time: now(),
      platform: Platform.OS,
      isExpoGo,
      redirectUri: (request as any)?.redirectUri ?? null,
      note: "Flow: ID TOKEN (bez exchangeCodeAsync).",
    });

    try {
      await (promptAsync as any)({ preferEphemeralSession: true });
      logSection("GOOGLE DEBUG / PROMPT ASYNC END", { time: now() });
    } catch (e) {
      console.log("❌ promptAsync error:", e);
      Alert.alert("Błąd", "promptAsync rzucił wyjątek (zobacz logi).");
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
