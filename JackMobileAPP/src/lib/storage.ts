import AsyncStorage from '@react-native-async-storage/async-storage';

import { DrinkLog, isDrinkLog, STORAGE_KEY } from '@/lib/caffeine';

export async function loadDrinkLogs(): Promise<DrinkLog[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isDrinkLog).sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export async function saveDrinkLogs(logs: DrinkLog[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export async function addDrinkLog(log: DrinkLog) {
  const logs = await loadDrinkLogs();
  await saveDrinkLogs([log, ...logs]);
}

export async function deleteDrinkLog(id: string) {
  const logs = await loadDrinkLogs();
  await saveDrinkLogs(logs.filter((log) => log.id !== id));
}

export async function clearDrinkLogs() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
