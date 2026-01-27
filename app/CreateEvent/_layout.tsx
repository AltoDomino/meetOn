import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function FormLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="PlaceDateform"
        options={{
          title: "LOKALIZACJA I DATA",
          headerStyle: {
            backgroundColor: "#1E3A8A",
          },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(auth)/CreateEvent")}
              style={{ paddingHorizontal: 10 }}
            >
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
            backgroundColor: "#1E3A8A",
          },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
