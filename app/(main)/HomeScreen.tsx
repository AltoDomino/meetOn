import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/HomeScreen.styles";

export default function Home() {
  const router = useRouter();
  const { userName, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const handleActivity = () => setModalVisible(true);

  const handleModalConfirm = () => {
    setModalVisible(false);
    router.push("/Activity/Activity");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/Login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screen}>
          {/* 🔥 LOGOUT BUTTON (opcjonalnie) */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 10,
              right: 15,
              zIndex: 10,
            }}
          >
            {/* <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                Wyloguj
              </Text>
            </TouchableOpacity> */}
          </View>

          {/* ✅ WYŚRODKOWANY OVERLAY */}
          <View
            style={[
              styles.overlay,
              {
                justifyContent: "center",
                flex: 1,
                marginTop: 0, // 👈 kasujemy stare przesunięcie
              },
            ]}
          >
            <Text style={styles.greeting}>Cześć</Text>
            <Text style={styles.greetingUser}>{userName}! 👋</Text>

            <Text style={styles.header}>Włącz aktywność</Text>

            <View style={{ width: "100%", gap: 10 }}>
              <Text style={styles.description}>
                meetOn pomoże Ci znaleźć ludzi, którzy chcą spędzać wolny czas
                tak jak Ty 🎯
              </Text>

              <Text style={styles.description}>
                🎲 Planszówki • 🏐 siatkówka • 🎤 karaoke • 🎱 bilard — wybór
                należy do Ciebie!
              </Text>

              <Text style={styles.description}>
                ❌ Ktoś wypadł z ekipy?{"\n"}meetOn błyskawicznie znajdzie
                kogoś na zastępstwo ⚡
              </Text>

              <Text style={styles.description}>
                🌍 Podróżujesz lub jesteś w nowym mieście?{"\n"}
                 Znajdź kompanów do wspólnych aktywności i poznawaj ludzi w
                naturalny sposób.
              </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleActivity}>
              <Text style={styles.buttonText}>Przeglądaj aktywności</Text>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="fade"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>UWAGA:</Text> wydarzenia,
                  które będą Ci proponowane są ściśle powiązane z aktywnościami,
                  które zaraz wybierzesz. Pamiętaj, że zawsze możesz je usuwać
                  lub dodać nowe, a wydarzenia będą się aktualizować zgodnie z
                  Twoimi preferencjami.
                </Text>

                <Pressable
                  onPress={handleModalConfirm}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Rozumiem</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
