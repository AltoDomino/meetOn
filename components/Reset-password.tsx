import { backend_URL } from "@/backendURL";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const token = useMemo(() => {
    const t = params?.token;
    return typeof t === "string" ? t : "";
  }, [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!token || token.length < 10) {
      Alert.alert("Błąd", "Brak lub nieprawidłowy token resetu.");
      return false;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert("Błąd", "Hasło musi mieć co najmniej 8 znaków.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Błąd", "Hasła nie są takie same.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(`${backend_URL}/api/login/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const text = await res.text().catch(() => "");
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        Alert.alert("Błąd", data?.message || "Nie udało się zresetować hasła.");
        return;
      }

      Alert.alert("Sukces", "Hasło zostało zmienione. Zaloguj się ponownie.", [
        {
          text: "OK",
          onPress: () => {
            // 🔁 dopasuj ścieżkę do Twojego ekranu logowania
            // jeśli login masz np. w app/Login.tsx -> router.replace("/Login")
            // jeśli w (auth)/Login -> router.replace("/(auth)/Login")
            router.replace("/(main)/Login");
          },
        },
      ]);

      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      Alert.alert("Błąd połączenia", "Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#07112b" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, justifyContent: "center", padding: 18 }}>
          <View
            style={{
              backgroundColor: "#0d1a4d",
              borderRadius: 18,
              padding: 18,
            }}
          >
            <Text style={{ color: "#EAF6FF", fontSize: 22, fontWeight: "900" }}>
              Reset hasła
            </Text>

            <Text style={{ color: "#EAF6FF", opacity: 0.9, marginTop: 8 }}>
              Ustaw nowe hasło dla swojego konta.
            </Text>

            {/* token debug (opcjonalnie) */}
            {!token ? (
              <Text style={{ color: "#ffb4b4", marginTop: 10 }}>
                Brak tokena w linku. Otwórz link z maila ponownie.
              </Text>
            ) : null}

            <Text
              style={{ color: "#EAF6FF", fontWeight: "700", marginTop: 16 }}
            >
              Nowe hasło
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Minimum 8 znaków"
              placeholderTextColor="rgba(255,255,255,0.55)"
              secureTextEntry
              editable={!loading}
              style={{
                marginTop: 8,
                backgroundColor: "rgba(255,255,255,0.92)",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 11,
                color: "#000",
                opacity: loading ? 0.7 : 1,
              }}
            />

            <Text
              style={{ color: "#EAF6FF", fontWeight: "700", marginTop: 14 }}
            >
              Powtórz hasło
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Powtórz nowe hasło"
              placeholderTextColor="rgba(255,255,255,0.55)"
              secureTextEntry
              editable={!loading}
              style={{
                marginTop: 8,
                backgroundColor: "rgba(255,255,255,0.92)",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 11,
                color: "#000",
                opacity: loading ? 0.7 : 1,
              }}
            />

            <TouchableOpacity
              onPress={submit}
              disabled={loading || !token}
              activeOpacity={0.85}
              style={{
                marginTop: 18,
                backgroundColor: "#1E3A8A",
                paddingVertical: 13,
                borderRadius: 14,
                alignItems: "center",
                opacity: loading || !token ? 0.65 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: "#EAF6FF", fontWeight: "900" }}>
                  ZAPISZ NOWE HASŁO
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={loading}
              style={{
                alignItems: "center",
                marginTop: 14,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#EAF6FF", fontWeight: "700" }}>Wróć</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
