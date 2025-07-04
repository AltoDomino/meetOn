import * as SecureStore from "expo-secure-store";

export const saveActivities = async (userName: string, activities: string[]) => {
  try {
    const key = `activities_${userName}`;
    const jsonValue = JSON.stringify(activities);
    await SecureStore.setItemAsync(key, jsonValue);
  } catch (e) {
    console.error("❌ Błąd zapisu aktywności:", e);
  }
};

export const loadActivities = async (userName: string): Promise<string[]> => {
  try {
    const key = `activities_${userName}`;
    const jsonValue = await SecureStore.getItemAsync(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("❌ Błąd ładowania aktywności:", e);
    return [];
  }
};
