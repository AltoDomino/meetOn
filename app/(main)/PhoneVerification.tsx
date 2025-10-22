import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { backend_URL } from "@/backendURL";

export default function PhoneVerification() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backend_URL}/api/phone/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (!res.ok) throw new Error("Nie udało się wysłać kodu.");
      setStep(2);
      alert("Kod został wysłany na podany numer 📲");
    } catch (err) {
      alert("Błąd przy wysyłaniu kodu. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backend_URL}/api/phone/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, code }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Numer telefonu został zweryfikowany!");
      } else {
        alert("❌ Błędny lub wygasły kod.");
      }
    } catch (err) {
      alert("Wystąpił błąd przy weryfikacji.");
    } finally {
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
              placeholder="np. +48 600 000 000"
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
            <Text style={styles.title}>Wpisz otrzymany kod</Text>
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
