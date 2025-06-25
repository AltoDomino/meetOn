import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { styles } from "./app/styles/SplashScreen.styles";
const SplashScreenComponent = () => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const animate = async () => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(async () => {
        await SplashScreen.hideAsync(); // <--- chowamy domyślny splash
        setTimeout(() => {
          router.replace("/(main)/HomeScreen");
        }, 1000);
      });
    };

    animate();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.logo, { opacity: fadeAnim }]}>
        meetOn 🟢
      </Animated.Text>
    </View>
  );
};

export default SplashScreenComponent;
