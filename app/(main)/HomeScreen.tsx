import React from "react";
import { Text, TouchableOpacity, ScrollView, View, Alert } from "react-native";
import { styles } from "../styles/HomeScreen.styles";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";


export default function Home() {
  const router = useRouter();
  const { userName } = useAuth();
  const handleActivity = () => router.push("/Activity/Activity");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>Cześć ! {userName}👋</Text>
      <Text style={styles.header}>
        Gotowy na nowe znajomości i świetną zabawę?
      </Text>

      <Text style={styles.description}>
        meetOn pomoże Ci znaleźć ludzi, którzy chcą spędzić wolny czas tak jak
        Ty —{"\n"}
        czy to planszówki, siatkówka, karaoke czy może laser tag?
      </Text>

      <Text style={styles.cta}>
        Wybierz aktywność i dołącz do grupy już teraz!
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleActivity}>
        <Text style={styles.buttonText}>Przeglądaj aktywności</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
