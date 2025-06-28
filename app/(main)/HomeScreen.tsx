import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { styles } from "../styles/HomeScreen.styles";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { userName } = useAuth();

  const handleActivity = () => router.push("/Activity/Activity");

  return (
    <ImageBackground
       source={require("@/assets/images/meetOn.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.overlay}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <Text style={styles.greeting}>Cześć {userName}! 👋</Text>
              <Text style={styles.header}>Włącz znajomości</Text>
              <Text style={styles.description}>
                meetOn pomoże Ci znaleźć ludzi, którzy chcą spędzać wolny czas tak
                jak Ty — planszówki, siatkówka, karaoke czy może bilard?.
              </Text>

              <TouchableOpacity style={styles.button} onPress={handleActivity}>
                <Text style={styles.buttonText}>Przeglądaj aktywności</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
