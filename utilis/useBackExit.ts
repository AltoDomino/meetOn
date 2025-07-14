import { useEffect } from "react";
import { BackHandler, Alert } from "react-native";

export const useBackExit = () => {
  useEffect(() => {
    const onBackPress = () => {
      Alert.alert(
        "Wyjście z aplikacji",
        "Czy na pewno chcesz wyjść z aplikacji?",
        [
          { text: "Nie", style: "cancel" },
          { text: "Tak", onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );
      return true; // blokuje domyślne cofnięcie
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => {
      subscription.remove(); // POPRAWNE USUNIĘCIE NASŁUCHIWANIA
    };
  }, []);
};
