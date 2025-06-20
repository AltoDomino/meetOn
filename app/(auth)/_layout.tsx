import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "./CustomDrawerContext";
import HomeScreen from "./HomeScreen";
import { Button } from "react-native";

const Drawer = createDrawerNavigator();

export default function DrawerLayout() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <Button title="☰" onPress={() => navigation.toggleDrawer()} />
        ),
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Strona główna" }}
      />
    </Drawer.Navigator>
  );
}
