// utils/activityStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveActivities = async (userName: string, activities: string[]) => {
  try {
    const key = `@activities_${userName}`;
    const jsonValue = JSON.stringify(activities);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Błąd zapisu aktywności', e);
  }
};

export const loadActivities = async (userName: string): Promise<string[]> => {
  try {
    const key = `@activities_${userName}`;
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Błąd ładowania aktywności', e);
    return [];
  }
};
