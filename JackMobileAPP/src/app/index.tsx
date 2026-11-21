import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DAILY_LIMIT_MG,
  DrinkLog,
  getActiveCaffeine,
  getSleepSafeHours,
  getTodayIntake,
  SLEEP_SAFE_MG,
} from '@/lib/caffeine';
import { clearDrinkLogs, deleteDrinkLog, loadDrinkLogs } from '@/lib/storage';

const colors = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  primary: '#4A2C2A',
  amber: '#D97706',
  warning: '#DC2626',
  text: '#2B211F',
  muted: '#746764',
  border: '#EAE1DB',
};

export default function HomeScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    try {
      setLogs(await loadDrinkLogs());
      setNow(Date.now());
    } catch {
      Alert.alert('Unable to load history', 'Please try reopening the app.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const activeCaffeine = useMemo(() => getActiveCaffeine(logs, now), [logs, now]);
  const activeRounded = Math.round(activeCaffeine);
  const todayIntake = useMemo(() => getTodayIntake(logs, new Date(now)), [logs, now]);
  const sleepSafeHours = getSleepSafeHours(activeRounded);
  const overLimit = todayIntake > DAILY_LIMIT_MG;
  const progress = Math.min(todayIntake / DAILY_LIMIT_MG, 1);

  const removeLog = useCallback(async (id: string) => {
    try {
      await deleteDrinkLog(id);
      setLogs((current) => current.filter((log) => log.id !== id));
      setNow(Date.now());
    } catch {
      Alert.alert('Could not delete drink', 'Please try again.');
    }
  }, []);

  const confirmClear = useCallback(() => {
    Alert.alert('Clear all history?', 'This removes every saved drink from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearDrinkLogs();
            setLogs([]);
            setNow(Date.now());
          } catch {
            Alert.alert('Could not clear history', 'Please try again.');
          }
        },
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>TODAY</Text>
            <Text style={styles.title}>Caffeine Meter</Text>
          </View>
          <View style={styles.beanBadge}>
            <Text style={styles.bean}>☕</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>ACTIVE CAFFEINE</Text>
          <View style={styles.activeRow}>
            <Text style={styles.activeValue}>{activeRounded}</Text>
            <Text style={styles.activeUnit}>mg active</Text>
          </View>
          <Text style={[styles.sleepStatus, activeRounded >= SLEEP_SAFE_MG && styles.sleepStatusBusy]}>
            {activeRounded >= SLEEP_SAFE_MG
              ? `Sleep-safe in ~${sleepSafeHours.toFixed(1)} hrs`
              : 'Ready for sleep (< 50mg active)'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.intakeHeader}>
            <Text style={styles.intakeLabel}>Today&apos;s intake</Text>
            <Text style={[styles.intakeValue, overLimit && styles.warningText]}>
              {todayIntake} / {DAILY_LIMIT_MG} mg
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
                overLimit && styles.warningBackground,
              ]}
            />
          </View>
          <Text style={styles.helperText}>
            {overLimit ? 'Daily limit exceeded' : `${DAILY_LIMIT_MG - todayIntake} mg remaining today`}
          </Text>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Drink History</Text>
          {logs.length > 0 && (
            <Pressable onPress={confirmClear} hitSlop={12}>
              <Text style={styles.clearText}>Clear All</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.amber} />
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={logs.length === 0 ? styles.emptyList : styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.logCard}>
                <View style={styles.logIcon}>
                  <Text style={styles.logIconText}>☕</Text>
                </View>
                <View style={styles.logDetails}>
                  <Text style={styles.logName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.logTime}>
                    {new Date(item.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.logMg}>{item.caffeineMg} mg</Text>
                <Pressable
                  accessibilityLabel={`Delete ${item.name}`}
                  hitSlop={10}
                  onPress={() => void removeLog(item.id)}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>☕</Text>
                <Text style={styles.emptyTitle}>No drinks logged yet</Text>
                <Text style={styles.emptyText}>
                  Tap &quot;+ Log Caffeine&quot; to start tracking.
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => router.push('/add')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>+  Log Caffeine</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 18,
  },
  eyebrow: { color: colors.amber, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.primary, fontSize: 29, fontWeight: '800', marginTop: 2 },
  beanBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3E9DD',
  },
  bean: { fontSize: 23 },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  summaryLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  activeRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 3 },
  activeValue: { color: colors.primary, fontSize: 50, fontWeight: '800', letterSpacing: -1.5 },
  activeUnit: { color: colors.primary, fontSize: 17, fontWeight: '700', marginLeft: 7 },
  sleepStatus: {
    alignSelf: 'flex-start',
    color: '#31704C',
    backgroundColor: '#E8F4EC',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 99,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  sleepStatusBusy: { color: '#8A4B09', backgroundColor: '#FFF1D9' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  intakeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  intakeLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  intakeValue: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  warningText: { color: colors.warning },
  progressTrack: {
    height: 9,
    borderRadius: 99,
    backgroundColor: '#EFE7E1',
    overflow: 'hidden',
    marginTop: 11,
  },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.amber },
  warningBackground: { backgroundColor: colors.warning },
  helperText: { color: colors.muted, fontSize: 12, marginTop: 8 },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  clearText: { color: colors.warning, fontSize: 13, fontWeight: '700' },
  listContent: { paddingBottom: 16, gap: 10 },
  emptyList: { flexGrow: 1 },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F6EEE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIconText: { fontSize: 19 },
  logDetails: { flex: 1, marginLeft: 12 },
  logName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  logTime: { color: colors.muted, fontSize: 12, marginTop: 3 },
  logMg: { color: colors.primary, fontSize: 14, fontWeight: '800', marginRight: 12 },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F9EFED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: { color: colors.warning, fontSize: 13, fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 36 },
  emptyIcon: { fontSize: 38, opacity: 0.6, marginBottom: 10 },
  emptyTitle: { color: colors.primary, fontSize: 17, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 5 },
  bottomBar: { paddingTop: 12, paddingBottom: 14 },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
