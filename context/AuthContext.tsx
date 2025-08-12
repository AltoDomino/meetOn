import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const BACKEND_URL = "https://meeton-backend-ffmo.onrender.com";

export type NotifyPrefs = {
  notificationRadiusKm: number;
  customNotifyEnabled: boolean;
  customNotifyLat: number | null;
  customNotifyLng: number | null;
};

type AuthContextType = {
  userId: number | null;
  userName: string;
  avatar: string | null;
  description: string;
  hasChosenActivities: boolean;
  notifyPrefs: NotifyPrefs | null;
  token: string | null;

  setUserId: (id: number | null) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setAvatar: (url: string | null) => Promise<void>;
  setDescription: (desc: string) => Promise<void>;
  setHasChosenActivities: (chosen: boolean) => Promise<void>;
  setToken: (token: string | null) => Promise<void>;

  setNotifyPrefs: (prefs: NotifyPrefs | null) => Promise<void>;
  setNotifyRadiusKm: (km: number) => Promise<void>;
  saveNotifyPrefsOnBackend: (
    radiusKm: number,
    custom?: Partial<Omit<NotifyPrefs, "notificationRadiusKm">>
  ) => Promise<boolean>;

  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserIdState] = useState<number | null>(undefined as any);
  const [userName, setUserNameState] = useState("");
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [description, setDescriptionState] = useState("");
  const [hasChosenActivities, setHasChosenActivitiesState] = useState(false);
  const [notifyPrefs, setNotifyPrefsState] = useState<NotifyPrefs | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // 🔁 Przywracanie danych
  useEffect(() => {
    const restoreAuthData = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedUserName = await SecureStore.getItemAsync("userName");
        const storedAvatar = await SecureStore.getItemAsync("avatar");
        const storedDescription = await SecureStore.getItemAsync("description");
        const storedHasChosen = await SecureStore.getItemAsync("hasChosenActivities");
        const storedNotifyPrefs = await SecureStore.getItemAsync("notifyPrefs");
        const storedToken = await SecureStore.getItemAsync("token");

        if (storedUserId && storedUserName) {
          setUserIdState(Number(storedUserId));
          setUserNameState(storedUserName);
          setAvatarState(storedAvatar || null);
          setDescriptionState(storedDescription || "");
          setHasChosenActivitiesState(storedHasChosen === "true");
          setTokenState(storedToken || null);
          if (storedNotifyPrefs) {
            try {
              setNotifyPrefsState(JSON.parse(storedNotifyPrefs));
            } catch {
              setNotifyPrefsState(null);
            }
          }
        } else {
          setUserIdState(null);
        }
      } catch (err) {
        console.error("❌ Błąd przywracania danych logowania:", err);
        setUserIdState(null);
      }
    };

    restoreAuthData();
  }, []);

  // ✅ Settery
  const setUserId = async (id: number | null) => {
    setUserIdState(id);
    if (id !== null) await SecureStore.setItemAsync("userId", id.toString());
    else await SecureStore.deleteItemAsync("userId");
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    if (name) await SecureStore.setItemAsync("userName", name);
    else await SecureStore.deleteItemAsync("userName");
  };

  const setAvatar = async (url: string | null) => {
    setAvatarState(url);
    if (url) await SecureStore.setItemAsync("avatar", url);
    else await SecureStore.deleteItemAsync("avatar");
  };

  const setDescription = async (desc: string) => {
    setDescriptionState(desc);
    if (desc) await SecureStore.setItemAsync("description", desc);
    else await SecureStore.deleteItemAsync("description");
  };

  const setHasChosenActivities = async (chosen: boolean) => {
    setHasChosenActivitiesState(chosen);
    await SecureStore.setItemAsync("hasChosenActivities", chosen ? "true" : "false");
  };

  const setToken = async (t: string | null) => {
    setTokenState(t);
    if (t) await SecureStore.setItemAsync("token", t);
    else await SecureStore.deleteItemAsync("token");
  };

  // 🔔 Preferencje powiadomień
  const setNotifyPrefs = async (prefs: NotifyPrefs | null) => {
    setNotifyPrefsState(prefs);
    if (prefs) await SecureStore.setItemAsync("notifyPrefs", JSON.stringify(prefs));
    else await SecureStore.deleteItemAsync("notifyPrefs");
  };

  const setNotifyRadiusKm = async (km: number) => {
    const next: NotifyPrefs = {
      notificationRadiusKm: km,
      customNotifyEnabled: notifyPrefs?.customNotifyEnabled ?? false,
      customNotifyLat: notifyPrefs?.customNotifyLat ?? null,
      customNotifyLng: notifyPrefs?.customNotifyLng ?? null,
    };
    await setNotifyPrefs(next);
  };

  const saveNotifyPrefsOnBackend = async (
    radiusKm: number,
    custom?: Partial<Omit<NotifyPrefs, "notificationRadiusKm">>
  ): Promise<boolean> => {
    if (!userId) return false;
    const body: any = {
      notificationRadiusKm: radiusKm,
      customNotifyEnabled: custom?.customNotifyEnabled ?? (notifyPrefs?.customNotifyEnabled ?? false),
      customNotifyLat: custom?.customNotifyLat ?? (notifyPrefs?.customNotifyLat ?? null),
      customNotifyLng: custom?.customNotifyLng ?? (notifyPrefs?.customNotifyLng ?? null),
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}/notification-prefs`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return false;
      const json = await res.json();
      const updated: NotifyPrefs = {
        notificationRadiusKm: json?.prefs?.notificationRadiusKm ?? radiusKm,
        customNotifyEnabled: json?.prefs?.customNotifyEnabled ?? body.customNotifyEnabled,
        customNotifyLat: json?.prefs?.customNotifyLat ?? body.customNotifyLat ?? null,
        customNotifyLng: json?.prefs?.customNotifyLng ?? body.customNotifyLng ?? null,
      };
      await setNotifyPrefs(updated);
      return true;
    } catch (e) {
      console.warn("saveNotifyPrefsOnBackend error:", e);
      return false;
    }
  };

  // 🚪 Wylogowanie
  const logout = async () => {
    setUserIdState(null);
    setUserNameState("");
    setAvatarState(null);
    setDescriptionState("");
    setHasChosenActivitiesState(false);
    setNotifyPrefsState(null);
    setTokenState(null);

    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("userName");
    await SecureStore.deleteItemAsync("avatar");
    await SecureStore.deleteItemAsync("description");
    await SecureStore.deleteItemAsync("hasChosenActivities");
    await SecureStore.deleteItemAsync("notifyPrefs");
    await SecureStore.deleteItemAsync("token");
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userName,
        avatar,
        description,
        hasChosenActivities,
        notifyPrefs,
        token,

        setUserId,
        setUserName,
        setAvatar,
        setDescription,
        setHasChosenActivities,
        setToken,

        setNotifyPrefs,
        setNotifyRadiusKm,
        saveNotifyPrefsOnBackend,

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
