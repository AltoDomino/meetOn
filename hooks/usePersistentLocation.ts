
import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";

export const usePersistentLocation = () => {
  const requestLoop = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();

    while (status !== "granted") {
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
  };

  requestLoop();
};
