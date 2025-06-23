import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function FormLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="form"
        options={{
          title: "Nowe wydarzenie",
          headerStyle: {
            backgroundColor: "#00A9F4"
          },
          headerTintColor: "#fff", 
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace("/(auth)/CreateEvent")} style={{ paddingHorizontal: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
