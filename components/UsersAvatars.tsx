// UserAvatars.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

const mockUsers = [
  { id: 1, name: "Anna" },
  { id: 2, name: "Bartek" },
  { id: 3, name: "Celina" },
  { id: 4, name: "Dawid" },
  { id: 5, name: "Ewa" },
];

export default function UserAvatars() {
  return (
    <View style={avatarStyles.container}>
      <Text style={avatarStyles.heading}>Uczestnicy:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mockUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={avatarStyles.avatarContainer}
            onPress={() => console.log("Kliknięto: ", user.name)}
          >
            <View style={avatarStyles.avatar}>
              <Text style={avatarStyles.initial}>{user.name[0]}</Text>
            </View>
            <Text style={avatarStyles.name}>{user.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  initial: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  name: {
    marginTop: 4,
    fontSize: 12,
  },
});
