import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function CustomDrawerContent(props: any) {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.topSection}>
        <Image
          // source={require('@/assets/images/avatar-placeholder.png')}
          style={styles.avatar}
        />
        <Text style={styles.username}>Twoje konto</Text>
      </View>

      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />

        <DrawerItem
          label="👤 Profil"
          onPress={() => router.push('/Profile')}
        />
        <DrawerItem
          label="📨 Zaproś znajomych"
          onPress={() => router.push('/InviteFriend')}
        />
        <DrawerItem
          label="🗓️ Stwórz wydarzenie"
          onPress={() => router.push('/Create-event')}
        />
      </View>

      <View style={styles.logoutContainer}>
        <DrawerItem
          label="🚪 Wyloguj się"
          onPress={handleLogout}
          labelStyle={{ color: 'red' }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  topSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ccc',
  },
  username: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    marginTop: 'auto',
  },
});
