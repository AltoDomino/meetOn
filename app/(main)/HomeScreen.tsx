import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
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

  // ile miejsca od góry zostawiamy na logo (responsywnie)
  const CONTENT_TOP = Math.max(insets.top + 280, 320);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require("@/assets/images/meetOn.png")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageInner} // 👈 dodane — kontrola wielkości tła
        >
          <View style={[styles.overlay, { paddingTop: CONTENT_TOP }]}>
            <Text style={styles.greeting}>Hej</Text>
            <Text style={styles.greetingUser}>{userName}! 👋</Text>
            <Text style={styles.header}>Włącz aktywność</Text>

            <Text style={styles.description}>
              meetOn pomoże Ci znaleźć ludzi, którzy chcą spędzać wolny czas tak
              jak Ty — planszówki, siatkówka, karaoke czy może bilard?
            </Text>

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
                <Pressable onPress={handleModalConfirm} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Rozumiem</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
