import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.replace("/(main)/Login");
  }, []);

  return null;
}
