import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";
import { useEffect } from "react";

export const usePersistentLocation = () => {
  if (Platform.OS === "web") return;

  useEffect(() => {
    let isMounted = true;

    const requestLoop = async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();

        while (isMounted && status !== "granted") {
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          status = newStatus;

          if (status === "granted") break;

          if (status === "denied" && Platform.OS === "android") {
            Alert.alert(
              "Lokalizacja wymagana",
              "Aby korzystać z aplikacji, przejdź do ustawień i przyznaj dostęp do lokalizacji.",
              [
                { text: "Ustawienia", onPress: () => Linking.openSettings() },
                { text: "Anuluj", style: "cancel" },
              ]
            );
            break;
          }

          await new Promise((res) => setTimeout(res, 3000));
        }
      } catch (err) {
        console.log("❌ Błąd lokalizacji:", err);
      }
    };

    const timer = setTimeout(requestLoop, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);
};
