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
          backgroundColor: "#1E3A8A",
        },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      })}
    >
      <Drawer.Screen
        name="Profile"
        options={{
          title: "👤 PROFIL",
          drawerLabel: "👤 PROFIL",
        }}
      />
      <Drawer.Screen
        name="FriendList"
        options={{
          title: "👫 ZNAJOMI",
          drawerLabel: "👫 ZNAJOMI",
        }}
      />
      <Drawer.Screen
        name="CreateEvent"
        options={{
          title: "🗓️ STWÓRZ WYDARZENIE",
          drawerLabel: "🗓️ STWÓRZ WYDARZENIE",
        }}
      />
      <Drawer.Screen
        name="Event"
        options={{
          title: "📍 WYDARZENIA",
          drawerLabel: "📍 WYDARZENIA",
        }}
      />
      <Drawer.Screen
        name="YourActivities"
        options={{
          title: "📝 TWOJE AKTYWNOŚCI",
          drawerLabel: "📝 TWOJE AKTYWNOŚCI",
        }}
      />
      <Drawer.Screen
        name="Logout"
        options={{
          title: "🚪 WYLOGUJ SIĘ",
          drawerLabel: "🚪 WYLOGUJ SIĘ",
          drawerLabelStyle: { color: "red" },
          headerTitleStyle: { color: "red" },
        }}
      />
    </Drawer>
  );
}
