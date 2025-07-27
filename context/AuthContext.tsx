import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type AuthContextType = {
  userId: number | null;
  userName: string;
  avatar: string | null;
  description: string;
  hasChosenActivities: boolean;
  setUserId: (id: number | null) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setAvatar: (url: string | null) => Promise<void>;
  setDescription: (desc: string) => Promise<void>;
  setHasChosenActivities: (chosen: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserIdState] = useState<number | null>(undefined as any); // undefined na start
  const [userName, setUserNameState] = useState("");
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [description, setDescriptionState] = useState("");
  const [hasChosenActivities, setHasChosenActivitiesState] = useState(false);

  // 🔁 Przywracanie danych przy starcie aplikacji
  useEffect(() => {
    const restoreAuthData = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedUserName = await SecureStore.getItemAsync("userName");
        const storedAvatar = await SecureStore.getItemAsync("avatar");
        const storedDescription = await SecureStore.getItemAsync("description");
        const storedHasChosen = await SecureStore.getItemAsync("hasChosenActivities");

        if (storedUserId && storedUserName) {
          setUserIdState(Number(storedUserId));
          setUserNameState(storedUserName);
          setAvatarState(storedAvatar || null);
          setDescriptionState(storedDescription || "");
          setHasChosenActivitiesState(storedHasChosen === "true");
        } else {
          setUserIdState(null);
        }
      } catch (err) {
        console.error("❌ Błąd przywracania danych logowania:", err);
      }
    };

    restoreAuthData();
  }, []);

  // ✅ Settery z zapisem do SecureStore

  const setUserId = async (id: number | null) => {
    setUserIdState(id);
    if (id !== null) {
      await SecureStore.setItemAsync("userId", id.toString());
    } else {
      await SecureStore.deleteItemAsync("userId");
    }
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    if (name) {
      await SecureStore.setItemAsync("userName", name);
    } else {
      await SecureStore.deleteItemAsync("userName");
    }
  };

  const setAvatar = async (url: string | null) => {
    setAvatarState(url);
    if (url) {
      await SecureStore.setItemAsync("avatar", url);
    } else {
      await SecureStore.deleteItemAsync("avatar");
    }
  };

  const setDescription = async (desc: string) => {
    setDescriptionState(desc);
    if (desc) {
      await SecureStore.setItemAsync("description", desc);
    } else {
      await SecureStore.deleteItemAsync("description");
    }
  };

  const setHasChosenActivities = async (chosen: boolean) => {
    setHasChosenActivitiesState(chosen);
    await SecureStore.setItemAsync("hasChosenActivities", chosen ? "true" : "false");
  };

  // 🚪 Wylogowanie
  const logout = async () => {
    setUserIdState(null);
    setUserNameState("");
    setAvatarState(null);
    setDescriptionState("");
    setHasChosenActivitiesState(false);

    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("userName");
    await SecureStore.deleteItemAsync("avatar");
    await SecureStore.deleteItemAsync("description");
    await SecureStore.deleteItemAsync("hasChosenActivities");
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userName,
        avatar,
        description,
        hasChosenActivities,
        setUserId,
        setUserName,
        setAvatar,
        setDescription,
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
