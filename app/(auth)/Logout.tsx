import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.replace("/(main)/Login"); 
  }, []);

  return null;
}
