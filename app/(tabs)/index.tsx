import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import Login from '../(main)/Login';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SplashScreen from "expo-splash-screen";
import { styles } from '../styles/index.styles';

export default function HomeScreen() {
SplashScreen.preventAutoHideAsync().catch(() => {});
  return (
      <Login />
  );
}


