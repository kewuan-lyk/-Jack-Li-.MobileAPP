# Caffeine Meter

Caffeine Meter is a two-screen, offline-first Expo app for logging caffeinated drinks, estimating active caffeine with a five-hour half-life, and showing how long it may take to fall below a 50 mg sleep-safe threshold.

## Features

- Home dashboard with active caffeine, sleep-safe estimate, and a 400 mg daily progress bar
- Add screen with four quick presets and a custom drink form
- Input validation, individual deletion, and confirmed Clear All
- Persistent local history through AsyncStorage
- No account, backend, paid service, or third-party API

## Privacy and security

Drink names, caffeine amounts, and timestamps stay in the app's local AsyncStorage. The app does not request credentials, health records, contacts, location, camera, or microphone access, and it sends no analytics or tracking data. AsyncStorage is intentionally used only for this non-sensitive log data and should not be used for passwords, tokens, or other secrets.

`npm audit --omit=dev` currently reports the moderate `GHSA-g3hv-75wg-m249` advisory through Expo 58's build-time `@expo/fingerprint → minimatch@10.2.6` dependency. The affected glob API is not exposed to drink-name input or used in the shipped app's data flow. npm's automatic fix would downgrade Expo to SDK 52, so it is intentionally not applied; update to a future compatible Expo 58 patch when Expo publishes the repaired dependency chain.

## Run with Expo Go

1. Install the free Expo Go app on an iOS or Android device.
2. From this directory, install dependencies:

   ```bash
   npm install
   ```

3. Start the local development server:

   ```bash
   npx expo start
   ```

4. Keep the computer and phone on the same network, then scan the QR code with Expo Go. If LAN discovery is unavailable, try:

   ```bash
   npx expo start --tunnel
   ```

The tunnel option uses Expo's development service but does not require a paid Expo plan.

## Run in a simulator

Start Expo with `npx expo start`, then press `i` for an installed iOS Simulator or `a` for an installed Android emulator.

## Validation

```bash
npx eslint .
npx tsc --noEmit
npx expo-doctor
npx expo export --platform ios
```

## Suggested demo recording

1. Open the Home screen and show the empty state.
2. Navigate to Log Caffeine.
3. Tap Americano and show the `Americano` / `95` auto-filled inputs.
4. Save and show the updated active caffeine, daily total, and history.
5. Force-close and reopen Expo Go to demonstrate persistence.
6. Delete one item, then demonstrate the Clear All confirmation with additional test entries.

The implementation follows the project-level `SPEC.md`. The independent implementation review is recorded in `REVIEW.md`.
