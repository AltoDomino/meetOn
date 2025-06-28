import Login from "../(main)/Login";
import * as SplashScreen from "expo-splash-screen";

export default function HomeScreen() {
  SplashScreen.preventAutoHideAsync().catch(() => {});
  return <Login />;
}
