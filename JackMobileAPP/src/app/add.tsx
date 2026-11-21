import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DrinkLog, MAX_CAFFEINE_MG, MAX_DRINK_NAME_LENGTH } from '@/lib/caffeine';
import { addDrinkLog } from '@/lib/storage';

const PRESETS = [
  { name: 'Espresso', caffeineMg: 65, icon: '☕' },
  { name: 'Americano', caffeineMg: 95, icon: '🥤' },
  { name: 'Matcha Latte', caffeineMg: 70, icon: '🍵' },
  { name: 'Black Tea', caffeineMg: 45, icon: '🫖' },
] as const;

const colors = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  primary: '#4A2C2A',
  amber: '#D97706',
  warning: '#DC2626',
  text: '#2B211F',
  muted: '#746764',
  border: '#E4D9D2',
};

export default function AddCaffeineScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [caffeineAmount, setCaffeineAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectPreset = (preset: (typeof PRESETS)[number]) => {
    setName(preset.name);
    setCaffeineAmount(String(preset.caffeineMg));
    setError('');
  };

  const save = async () => {
    const trimmedName = name.trim();
    const caffeineMg = Number(caffeineAmount);

    if (
      !trimmedName ||
      trimmedName.length > MAX_DRINK_NAME_LENGTH ||
      !Number.isInteger(caffeineMg) ||
      caffeineMg <= 0 ||
      caffeineMg > MAX_CAFFEINE_MG
    ) {
      setError('Please enter a valid drink name and caffeine amount.');
      return;
    }

    const log: DrinkLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      caffeineMg,
      timestamp: Date.now(),
    };

    try {
      setSaving(true);
      await addDrinkLog(log);
      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Could not save drink', 'Please check your device storage and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.title}>What did you drink?</Text>
            <Text style={styles.subtitle}>Choose a favorite or enter your own caffeine amount.</Text>
          </View>

          <Text style={styles.sectionLabel}>QUICK PRESETS</Text>
          <View style={styles.presetGrid}>
            {PRESETS.map((preset) => {
              const selected =
                name === preset.name && caffeineAmount === String(preset.caffeineMg);
              return (
                <Pressable
                  key={preset.name}
                  onPress={() => selectPreset(preset)}
                  style={({ pressed }) => [
                    styles.presetCard,
                    selected && styles.presetSelected,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={styles.presetIcon}>{preset.icon}</Text>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetMg}>{preset.caffeineMg} mg</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Custom drink</Text>
            <Text style={styles.inputLabel}>Drink Name</Text>
            <TextInput
              accessibilityLabel="Drink Name"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={MAX_DRINK_NAME_LENGTH}
              onChangeText={(value) => {
                setName(value);
                setError('');
              }}
              placeholder="e.g., Iced Latte"
              placeholderTextColor="#A59791"
              style={styles.input}
              value={name}
            />

            <Text style={styles.inputLabel}>Caffeine Amount</Text>
            <View style={styles.amountInputWrap}>
              <TextInput
                accessibilityLabel="Caffeine Amount"
                keyboardType="number-pad"
                maxLength={String(MAX_CAFFEINE_MG).length}
                onChangeText={(value) => {
                  setCaffeineAmount(value.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                placeholder="e.g., 120"
                placeholderTextColor="#A59791"
                style={styles.amountInput}
                value={caffeineAmount}
              />
              <Text style={styles.mgSuffix}>mg</Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteIcon}>ⓘ</Text>
            <Text style={styles.noteText}>
              Estimates use a 5-hour caffeine half-life and a 50 mg sleep-safe threshold.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            disabled={saving}
            onPress={() => void save()}
            style={({ pressed }) => [
              styles.saveButton,
              (pressed || saving) && styles.pressed,
            ]}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Drink'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 },
  intro: { marginBottom: 26 },
  title: { color: colors.primary, fontSize: 27, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 11,
  },
  presetCard: {
    width: '48.3%',
    minHeight: 122,
    padding: 15,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  presetSelected: { borderColor: colors.amber, backgroundColor: '#FFF8EC' },
  presetIcon: { fontSize: 25, marginBottom: 11 },
  presetName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  presetMg: { color: colors.amber, fontSize: 13, fontWeight: '700', marginTop: 4 },
  formCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: { color: colors.primary, fontSize: 18, fontWeight: '800', marginBottom: 18 },
  inputLabel: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FDFBF9',
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 16,
    marginBottom: 17,
  },
  amountInputWrap: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FDFBF9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: { flex: 1, height: '100%', paddingHorizontal: 14, color: colors.text, fontSize: 16 },
  mgSuffix: { color: colors.muted, fontSize: 14, fontWeight: '700', paddingRight: 14 },
  errorBox: {
    marginTop: 13,
    borderRadius: 10,
    backgroundColor: '#FDECE9',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { color: colors.warning, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  noteBox: { flexDirection: 'row', paddingHorizontal: 5, marginTop: 18 },
  noteIcon: { color: colors.amber, fontSize: 16, marginRight: 8 },
  noteText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
