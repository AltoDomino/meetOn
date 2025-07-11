import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/HomeScreen.styles";

export default function Home() {
  const router = useRouter();
  const { userName } = useAuth();

  const handleActivity = () => router.push("/Activity/Activity");

  return (
    <ImageBackground
      source={require("@/assets/images/ikonameeton.png")}
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
                meetOn pomoże Ci znaleźć ludzi, którzy chcą spędzać wolny czas
                tak jak Ty — planszówki, siatkówka, karaoke czy może bilard?.
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
