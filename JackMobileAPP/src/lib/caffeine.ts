export const STORAGE_KEY = '@caffeine_tracker_logs_v1';
export const DAILY_LIMIT_MG = 400;
export const HALF_LIFE_HOURS = 5;
export const SLEEP_SAFE_MG = 50;
export const MAX_DRINK_NAME_LENGTH = 80;
export const MAX_CAFFEINE_MG = 9_999;

export type DrinkLog = {
  id: string;
  name: string;
  caffeineMg: number;
  timestamp: number;
};

export function getActiveCaffeine(logs: DrinkLog[], now = Date.now()) {
  return logs.reduce((total, log) => {
    const elapsedHours = Math.max(0, now - log.timestamp) / 3_600_000;
    return total + log.caffeineMg * Math.pow(0.5, elapsedHours / HALF_LIFE_HOURS);
  }, 0);
}

export function getTodayIntake(logs: DrinkLog[], now = new Date()) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ).getTime();

  return logs
    .filter((log) => log.timestamp >= startOfToday && log.timestamp < startOfTomorrow)
    .reduce((total, log) => total + log.caffeineMg, 0);
}

export function getSleepSafeHours(activeCaffeineMg: number) {
  if (activeCaffeineMg < SLEEP_SAFE_MG) {
    return 0;
  }

  return HALF_LIFE_HOURS * Math.log2(activeCaffeineMg / SLEEP_SAFE_MG);
}

export function isDrinkLog(value: unknown): value is DrinkLog {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const log = value as Partial<DrinkLog>;
  return (
    typeof log.id === 'string' &&
    typeof log.name === 'string' &&
    log.name.trim().length > 0 &&
    log.name.length <= MAX_DRINK_NAME_LENGTH &&
    typeof log.caffeineMg === 'number' &&
    Number.isFinite(log.caffeineMg) &&
    Number.isInteger(log.caffeineMg) &&
    log.caffeineMg > 0 &&
    log.caffeineMg <= MAX_CAFFEINE_MG &&
    typeof log.timestamp === 'number' &&
    Number.isFinite(log.timestamp)
  );
}
