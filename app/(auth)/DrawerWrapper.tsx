import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // <== dodaj tę ikonę
import Home from "./HomeScreen";
import inviteFriend from "../InviteFriend";
import Profile from "../Profile";
import CreateEvent from "../Create-event";

const Drawer = createDrawerNavigator();

export default function DrawerWrapper() {
  return (
    <Drawer.Navigator
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 40 }} 
          >
            <Ionicons name="menu" size={30} color="#000" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="Home"
        options={{ title: "Strona główna" }}
        children={() => <Home />}
      />
      <Drawer.Screen
        name="profile"
        options={{ title: "Profil" }}
        component={Profile}
      />
      <Drawer.Screen
        name="friends"
        options={{ title: "Zaproś znajomych" }}
        component={inviteFriend}
      />
      <Drawer.Screen
        name="create-event"
        options={{ title: "Stwórz wydarzenie" }}
        component={CreateEvent}
      />
    </Drawer.Navigator>
  );
}
