import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
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
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/HomeScreen.styles";

export default function Home() {
  const router = useRouter();
  const { userName, logout } = useAuth(); // <== dodaj logout
  const [modalVisible, setModalVisible] = useState(false);

  const handleActivity = () => {
    setModalVisible(true);
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    router.push("/Activity/Activity");
  };

  const handleLogout = async () => {
    await logout(); // czyszczenie kontekstu / tokena
    router.replace("/Login"); // przekierowanie np. na ekran powitalny
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Logo na górze */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/ikonameeton.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.greeting}>Cześć</Text>
            <Text style={styles.greetingUser}>{userName}! 👋</Text>
            <Text style={styles.header}>Włącz aktywność</Text>
            <Text style={styles.description}>
              meetOn pomoże Ci znaleźć ludzi, którzy chcą spędzać wolny czas tak
              jak Ty — planszówki, siatkówka, karaoke czy może bilard?
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleActivity}>
              <Text style={styles.buttonText}>Przeglądaj aktywności</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#888" }]}
              onPress={handleLogout}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                Wyloguj się
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>UWAGA:</Text> wydarzenia
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
