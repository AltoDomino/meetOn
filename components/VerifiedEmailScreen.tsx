// app/verify-email.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
          `${BACKEND_URL}/api/verify-email?token=${encodeURIComponent(token)}`,
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
      Linking.openURL(
        `meeton://verify-email?token=${encodeURIComponent(token)}`,
      );
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" />
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
  container: {
    flex: 1,
    backgroundColor: "#0d1a4d",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
