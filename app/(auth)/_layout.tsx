import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { TouchableOpacity } from "react-native";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: "#00A9F4"
        },
        headerTitleAlign: "center",
      })}
    >
      <Drawer.Screen
        name="Profile"
        options={{
          title: "👤 Profil",
          drawerLabel: "👤 Profil",
        }}
      />
      <Drawer.Screen
        name="FriendList"
        options={{
          title: "📨 Zaproś znajomych",
          drawerLabel: "📨 Zaproś znajomych",
        }}
      />
      <Drawer.Screen
        name="CreateEvent"
        options={{
          title: "🗓️ Stwórz wydarzenie",
          drawerLabel: "🗓️ Stwórz wydarzenie",
        }}
      />
      <Drawer.Screen
        name="Event"
        options={{
          title: "📍 Wydarzenia",
          drawerLabel: "📍 Wydarzenia",
        }}
      />
      <Drawer.Screen
        name="YourActivities"
        options={{
          title: "📝 Twoje Aktywności",
          drawerLabel: "📝 Twoje Aktywności",
        }}
      />
      <Drawer.Screen
        name="Logout"
        options={{
          title: "🚪 Wyloguj się",
          drawerLabel: "🚪 Wyloguj się",
          drawerLabelStyle: { color: "red" },
          headerTitleStyle: { color: "red" },
        }}
      />
    </Drawer>
  );
}
