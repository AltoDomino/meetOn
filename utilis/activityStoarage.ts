import * as SecureStore from "expo-secure-store";

const isValidUserName = (userName: string): boolean => {
  const trimmed = userName.trim();
  const isValid = /^[a-zA-Z0-9._-]+$/.test(trimmed);

  console.log("🧪 Sprawdzany userName:", `"${userName}"`);
  console.log("🔎 Po trim():", `"${trimmed}"`);
  console.log(
    "🔡 Znaki + kody:",
    trimmed
      .split("")
      .map((c) => `${c} [${c.charCodeAt(0)}]`)
      .join(" | ")
  );
  console.log("✅ Czy poprawny?", isValid);

  return isValid;
};

export const loadActivities = async (userName: string) => {
  try {
    if (!userName || typeof userName !== "string" || !isValidUserName(userName)) {
      console.warn("⛔ Nieprawidłowy userName w loadActivities:", userName);
      return [];
    }

    const key = `activities_${userName.trim()}`;
    const storedData = await SecureStore.getItemAsync(key);
    console.log("📥 Odczytano z SecureStore:", storedData);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("❌ Błąd ładowania aktywności:", error);
    return [];
  }
};

export const saveActivities = async (userName: string, activities: any[]) => {
  try {
    if (!userName || typeof userName !== "string" || !isValidUserName(userName)) {
      console.warn("⛔ Nieprawidłowy userName w saveActivities:", userName);
      return;
    }

    const key = `activities_${userName.trim()}`;
    await SecureStore.setItemAsync(key, JSON.stringify(activities));
    console.log("💾 Zapisano aktywności:", activities, "pod kluczem:", key);
  } catch (error) {
    console.error("❌ Błąd zapisu aktywności:", error);
  }
};

export const clearActivities = async (userName: string) => {
  try {
    if (!userName || typeof userName !== "string" || !isValidUserName(userName)) {
      console.warn("⛔ Nieprawidłowy userName w clearActivities:", userName);
      return;
    }

    const key = `activities_${userName.trim()}`;
    await SecureStore.deleteItemAsync(key);
    console.log("🧹 Usunięto aktywności z klucza:", key);
  } catch (error) {
    console.error("❌ Błąd czyszczenia aktywności:", error);
  }
};
