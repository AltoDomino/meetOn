import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";

const screen = Dimensions.get("window");

SplashScreen.preventAutoHideAsync();

const Splash = ({ onFinish }: { onFinish: () => void }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onFinish)();
      });
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/startMeetOn.png")}
        style={[styles.logo, animatedStyle]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: screen.width * 0.6,
    height: screen.width * 0.6,
  },
});

export default Splash;
