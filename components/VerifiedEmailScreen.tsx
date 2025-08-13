// app/verify-email.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Platform, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

export default function VerifiedEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setOk(false);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/verify-email?token=${encodeURIComponent(token)}`
        );
        setOk(res.ok);
      } catch {
        setOk(false);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const openApp = () => {
    if (token) {
      Linking.openURL(`meeton://verify-email?token=${encodeURIComponent(token)}`);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#00A9F4" />
      ) : ok ? (
        <>
          <Text style={styles.title}>✅ E-mail został zweryfikowany!</Text>
          {(Platform.OS === "ios" || Platform.OS === "android") && (
            <TouchableOpacity style={styles.button} onPress={openApp}>
              <Text style={styles.buttonText}>Otwórz aplikację</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.title}>❌ Link jest nieprawidłowy lub wygasł.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1a4d", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: "#00A9F4", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
