import { Slot } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { ActivityProvider } from "./context/ActivityContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ActivityProvider>
        <Slot />
      </ActivityProvider>
    </AuthProvider>
  );
}
