import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type AuthContextType = {
  userId: number | null;
  userName: string;
  hasChosenActivities: boolean;
  setUserId: (id: number) => void;
  setUserName: (name: string) => void;
  setHasChosenActivities: (chosen: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [hasChosenActivities, setHasChosenActivitiesState] = useState(false);

  useEffect(() => {
    const loadActivityFlag = async () => {
      try {
        const flag = await SecureStore.getItemAsync("hasChosenActivities");
        setHasChosenActivitiesState(flag === "true");
      } catch (err) {
        console.error("❌ Błąd ładowania flagi hasChosenActivities:", err);
      }
    };
    loadActivityFlag();
  }, []);

  const setHasChosenActivities = async (chosen: boolean): Promise<void> => {
    try {
      setHasChosenActivitiesState(chosen);
      await SecureStore.setItemAsync("hasChosenActivities", chosen ? "true" : "false");
    } catch (err) {
      console.error("❌ Błąd ustawiania flagi hasChosenActivities:", err);
    }
  };

  const logout = async (): Promise<void> => {
    setUserName("");
    setUserId(null);
    setHasChosenActivitiesState(false);
    try {
      await SecureStore.deleteItemAsync("hasChosenActivities");
    } catch (err) {
      console.error("❌ Błąd podczas usuwania flagi przy wylogowaniu:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userName,
        hasChosenActivities,
        setUserId,
        setUserName,
        setHasChosenActivities,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
