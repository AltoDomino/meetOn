import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function FormLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="PlaceDateform"
        options={{
          title: "LOKALIZACJA I DATA",
          headerStyle: {
            backgroundColor: "#00A9F4",
          },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push("/(auth)/CreateEvent")} style={{ paddingHorizontal: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="DetailsForm"
        options={{
          title: "SZCZEGÓŁY WYDARZENIA",
          headerStyle: {
            backgroundColor: "#00A9F4",
          },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
