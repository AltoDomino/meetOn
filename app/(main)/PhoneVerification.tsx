import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { backend_URL } from "@/backendURL";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";   

const normalizePhoneNumber = (input: string) => {
  let phone = input.replace(/\s+/g, "").replace(/-/g, "");
  if (!phone.startsWith("+")) phone = "+48" + phone; 
  return phone;
};

export default function PhoneVerification() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const { token, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("📱 [PhoneVerification] MOUNT", { userId, hasToken: !!token });
    return () => {
      console.log("📱 [PhoneVerification] UNMOUNT");
    };
  }, [userId, token]);

  const sendCode = async () => {
    console.log("🔥 [sendCode] START wywołania, loading =", loading);

    if (loading) {
      console.log("⏹ [sendCode] przerwane – loading=true (drugi klik / podwójne wywołanie)");
      return;
    }

    const phoneNormalized = normalizePhoneNumber(phone);

    console.log("📲 [sendCode] DEBUG dane wejściowe:", {
      phoneInput: phone,
      phoneNormalized,
      userId,
      hasToken: !!token,
    });

    if (!phoneNormalized) {
      Alert.alert("Błąd", "Podaj numer telefonu.");
      return;
    }
    if (!userId) {
      Alert.alert("Błąd", "Brak userId – zaloguj się ponownie.");
      return;
    }

    try {
      console.log("⏳ [sendCode] ustawiam loading=true");
      setLoading(true);

      const payload = {
        phoneNumber: phoneNormalized,
        userId,
      };

      console.log("📦 [sendCode] payload wysyłany do backendu:", payload);

      const res = await fetch(`${backend_URL}/api/phone/send-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("📨 [sendCode] status odpowiedzi:", res.status);
      console.log("📨 [sendCode] raw response body:", text);

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        const msg = data?.error || data?.message || "Nie udało się wysłać kodu";
        console.log("⚠️ [sendCode] backend zwrócił błąd:", msg);
        throw new Error(msg);
      }

      console.log("✅ [sendCode] sukces – przełączam step na 2");
      setStep(2);
      Alert.alert("Sukces", "Kod został wysłany na podany numer 📲");
    } catch (err: any) {
      console.error("❌ [sendCode] ERROR object:", err);
      console.log("❌ [sendCode] ERROR message:", err?.message);
      Alert.alert("Błąd", err?.message || "Nie udało się wysłać kodu SMS.");
    } finally {
      console.log("⏳ [sendCode] ustawiam loading=false (finally)");
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    console.log("🔥 [verifyCode] START, loading =", loading);

    const phoneNormalized = normalizePhoneNumber(phone);

    console.log("🔐 [verifyCode] DEBUG dane wejściowe:", {
      phoneInput: phone,
      phoneNormalized,
      code,
      userId,
    });

    if (!phoneNormalized || !code) {
      Alert.alert("Błąd", "Podaj numer telefonu i kod SMS.");
      return;
    }
    if (!userId) {
      Alert.alert("Błąd", "Brak userId – zaloguj się ponownie.");
      return;
    }

    try {
      console.log("⏳ [verifyCode] ustawiam loading=true");
      setLoading(true);

      const payload = {
        phoneNumber: phoneNormalized,
        code,
        userId,
      };

      console.log("📦 [verifyCode] payload wysyłany do backendu:", payload);

      const res = await fetch(`${backend_URL}/api/phone/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("📨 [verifyCode] status odpowiedzi:", res.status);
      console.log("📨 [verifyCode] raw response body:", text);

      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (res.ok && data?.success) {
        console.log("✅ [verifyCode] sukces weryfikacji");
        Alert.alert("✅ Sukces", "Numer telefonu został zweryfikowany!", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(main)/HomeScreen");
            },
          },
        ]);
      } else {
        console.log("⚠️ [verifyCode] błąd logiczny:", data?.error || data?.raw);
        Alert.alert("❌ Błąd", data?.error || "Błędny lub wygasły kod.");
      }
    } catch (err: any) {
      console.error("❌ [verifyCode] ERROR object:", err);
      console.log("❌ [verifyCode] ERROR message:", err?.message);
      Alert.alert("Błąd", "Wystąpił problem przy weryfikacji.");
    } finally {
      console.log("⏳ [verifyCode] ustawiam loading=false (finally)");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.background}
    >
      <View style={styles.formContainer}>
        {step === 1 ? (
          <>
            <Text style={styles.title}>Podaj numer telefonu</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholder="+48 600 000 000"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={sendCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Wysyłanie..." : "Wyślij kod"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Wpisz kod SMS</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              placeholder="Kod SMS"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={verifyCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Sprawdzanie..." : "Potwierdź kod"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d1a4d",
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#00A9F4",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#007bb8",
  },
});
