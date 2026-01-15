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

  // ✅ LIVE podgląd kontekstu — czy gender faktycznie się ustawia
  useEffect(() => {
    logSection("AUTH CONTEXT DEBUG / CURRENT", {
      time: now(),
      gender: (auth as any)?.gender ?? null,
      userId: (auth as any)?.userId ?? null,
      userName: (auth as any)?.userName ?? null,
      hasToken: !!(auth as any)?.token,
    });
  }, [(auth as any)?.gender, (auth as any)?.userId, (auth as any)?.token]);

  const { control, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get("window").height;

  // ====== ENV / BUILD DEBUG ======
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === "storeClient";

  const buildInfo = useMemo(
    () => ({
      time: now(),
      platform: Platform.OS,
      isExpoGo,
      appOwnership: Constants.appOwnership,
      executionEnvironment: (Constants as any)?.executionEnvironment,
      releaseChannel: (Constants as any)?.manifest2?.extra?.expoClient
        ?.releaseChannel,
      updateId: (Constants as any)?.expoConfig?.updates?.url,
      schemeFromConfig: (Constants as any)?.expoConfig?.scheme,
      androidPackage: (Constants as any)?.expoConfig?.android?.package,
      iosBundleId: (Constants as any)?.expoConfig?.ios?.bundleIdentifier,
      owner: (Constants as any)?.expoConfig?.owner,
      slug: (Constants as any)?.expoConfig?.slug,
      version: (Constants as any)?.expoConfig?.version,
    }),
    [isExpoGo]
  );

  // ====== REDIRECT DEBUG ======
  const redirectUri = useMemo(() => {
    const uri = AuthSession.makeRedirectUri({
      scheme: "meeton",
      path: "oauth2redirect/google",
    });
    console.log("✅ [GOOGLE] redirectUri:", uri);
    return uri;
  }, []);

  // ====== CLIENT IDS DEBUG ======
  const clientIds = useMemo(
    () => ({
      expoClientId: mask(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID),
      webClientId: mask(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID),
      androidClientId: mask(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
      iosClientId: mask(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
      note: "Maskowane. Jeśli któryś jest null/undefined -> masz problem w env. Android/iOS Client ID muszą pochodzić z Google Cloud (typ Android/iOS).",
    }),
    []
  );

  useEffect(() => {
    logSection("APP / BUILD INFO", buildInfo);
    logSection("GOOGLE DEBUG / CLIENT IDS", clientIds);
  }, [buildInfo, clientIds]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,

    scopes: ["openid", "profile", "email"],
    responseType: "id_token",
    selectAccount: true,
    redirectUri,
  });

  // ====== REQUEST DEBUG ======
  useEffect(() => {
    logSection("GOOGLE DEBUG / REQUEST OBJECT", {
      time: now(),
      requestExists: !!request,
      request: request
        ? {
            clientId: (request as any)?.clientId,
            redirectUri: (request as any)?.redirectUri,
            responseType: (request as any)?.responseType,
            scopes: (request as any)?.scopes,
            state: (request as any)?.state,
            codeChallenge: (request as any)?.codeChallenge,
            codeChallengeMethod: (request as any)?.codeChallengeMethod,
            url: (request as any)?.url,
          }
        : null,
      hint: "Jeśli request.url jest null lub wygląda dziwnie, to znaczy że config requestu jest niepoprawny.",
    });
  }, [request]);

  // ====== RESPONSE DEBUG ======
  useEffect(() => {
    if (!response) return;

    logSection("GOOGLE DEBUG / RAW RESPONSE (FULL)", safeJson(response));

    if (response.type === "success") {
      logSection("GOOGLE DEBUG / SUCCESS DETAILS", {
        time: now(),
        hasAuth: !!response.authentication,
        auth: response.authentication
          ? {
              accessToken: mask((response.authentication as any).accessToken),
              idToken: mask((response.authentication as any).idToken),
              refreshToken: mask((response.authentication as any).refreshToken),
              tokenType: (response.authentication as any).tokenType,
              expiresIn: (response.authentication as any).expiresIn,
              issuedAt: (response.authentication as any).issuedAt,
              scope: (response.authentication as any).scope,
            }
          : null,
        params: (response as any).params,
      });

      const idToken = response.authentication?.idToken;
      if (idToken) {
        loginWithGoogleOnBackend(idToken);
      } else {
        Alert.alert("Błąd", "Google zalogowało, ale nie zwróciło id_token.");
      }
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

      Alert.alert(
        "Błąd Google",
        "Google zwróciło błąd. Sprawdź logi w konsoli."
      );
      return;
    }

    if (response.type === "dismiss") {
      logSection("GOOGLE DEBUG / DISMISSED", { time: now() });
      Alert.alert("Przerwano", "Użytkownik anulował logowanie");
      return;
    }

    logSection("GOOGLE DEBUG / OTHER RESPONSE TYPE", {
      time: now(),
      type: response.type,
      response,
    });
  }, [response]);

  // ====== BACKEND GOOGLE DEBUG ======
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
          `Status: ${res.status}\nZobacz logi w konsoli.`
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
  const fetchAndSetGenderIfMissing = async (
    userId: number,
    jwt?: string | null
  ) => {
    try {
      logSection("GENDER DEBUG / PROFILE FETCH REQUEST", {
        time: now(),
        url: `${backend_URL}/api/users/${userId}`,
        hasJwt: !!jwt,
      });

      const res = await fetch(`${backend_URL}/api/users/${userId}`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      });

      const text = await res.text().catch(() => "");
      logSection("GENDER DEBUG / PROFILE FETCH RESPONSE RAW", {
        time: now(),
        status: res.status,
        ok: res.ok,
        bodyText: text?.slice(0, 2000),
      });

      if (!res.ok) return;

      const profile = text ? JSON.parse(text) : {};
      logSection("GENDER DEBUG / PROFILE PARSED", {
        time: now(),
        profileGenderRaw: profile?.gender ?? null,
        profileKeys: Object.keys(profile || {}),
      });

      const g = normalizeGender(profile?.gender);
      logSection("GENDER DEBUG / PROFILE NORMALIZED", {
        time: now(),
        normalizedGender: g,
      });

      await setGender(g);
      logSection("GENDER DEBUG / PROFILE setGender DONE", {
        time: now(),
        setGenderValue: g,
      });
    } catch (e) {
      logSection("GENDER DEBUG / PROFILE FETCH ERROR", e);
    }
  };

  // ====== POST AUTH ======
  const afterAuthSuccess = async (data: any, provider: AuthProvider) => {
    try {
      logSection("AUTH DEBUG / afterAuthSuccess INPUT", { provider, data });

      const jwt = data.token ?? null;
      const uid = data.userId ?? null;

      await setToken(jwt);
      await setUserName(data.userName ?? "");
      await setUserId(uid);

      // avatar/description w Twoich payloadach mogą mieć różne nazwy, ale logi pokażą
      await setAvatar(data.avatar || data.avatarUrl || null);
      await setDescription(data.description || "");

      // ✅ GENDER DEBUG: payload -> normalize -> setGender
      logSection("GENDER DEBUG / BACKlog", {
        time: now(),
        provider,
        rawGenderFromBackend: data?.gender ?? null,
        rawType: typeof data?.gender,
        note: "Jeśli rawGenderFromBackend jest null -> backend nie zwraca gender albo user w DB ma null (częste po Google/Apple).",
      });

      const gFromLogin = normalizeGender(data?.gender);

      logSection("GENDER DEBUG / NORMALIZED", {
        time: now(),
        provider,
        normalizedGender: gFromLogin,
      });

      await setGender(gFromLogin);

      logSection("GENDER DEBUG / SET_GENDER_DONE", {
        time: now(),
        provider,
        setGenderValue: gFromLogin,
      });

      if (!gFromLogin && uid) {
        logSection("GENDER DEBUG / FALLBACK FETCH PROFILE (START)", {
          time: now(),
          userId: uid,
          hasJwt: !!jwt,
        });

        await fetchAndSetGenderIfMissing(Number(uid), jwt);

        logSection("GENDER DEBUG / FALLBACK FETCH PROFILE (END)", {
          time: now(),
          userId: uid,
        });
      }

      const isPhoneVerified = data?.isPhoneVerified;
      const isRegistrationComplete = data?.isRegistrationComplete;

      logSection("AUTH DEBUG / FLAGS", {
        provider,
        isPhoneVerified,
        isRegistrationComplete,
        ENABLE_PHONE_VERIFICATION,
      });

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
        const interestsRes = await fetch(
          `${backend_URL}/api/interests/${uid}`,
          {
            headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
          }
        );

        const interests = interestsRes.ok ? await interestsRes.json() : [];
        hasActivities = Array.isArray(interests) && interests.length > 0;
        await setHasChosenActivities(hasActivities);

        logSection("AUTH DEBUG / INTERESTS", {
          interestsType: Array.isArray(interests) ? "array" : typeof interests,
          interestsLength: Array.isArray(interests) ? interests.length : null,
        });
      } catch (e) {
        logSection("AUTH DEBUG / INTERESTS ERROR", e);
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

    logSection("GOOGLE DEBUG / PROMPT ASYNC START", {
      time: now(),
      isExpoGo,
      redirectUri,
      note: "Jeśli masz 400 invalid_request na ekranie Google, to zwykle redirect mismatch albo konfiguracja clientId/sha1.",
    });

    try {
      await promptAsync();
      logSection("GOOGLE DEBUG / PROMPT ASYNC END", { time: now() });
    } catch (e) {
      logSection("GOOGLE DEBUG / PROMPT ASYNC THROW", e);
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
              <ActivityIndicator size="large" color="#3A8FB7" />
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
