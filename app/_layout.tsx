import { AuthProvider } from "./context/AuthContext";
import { Slot } from "expo-router";
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
