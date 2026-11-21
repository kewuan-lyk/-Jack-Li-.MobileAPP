# App Specification: Caffeine & Sleep-Safe Tracker

## Overview
A simple mobile application built with React Native and Expo (using Expo Router) that helps coffee and tea drinkers track their daily caffeine intake and monitor how much caffeine remains active in their body. The app provides an immediate visual status of daily consumption against a 400mg healthy limit and estimates when active caffeine will decay below a sleep-safe threshold (50mg).

## Core Features

- Real-Time Active Caffeine Calculation (5-Hour Half-Life): Automatically computes remaining active caffeine in the body using exponential decay (`remaining = caffeineMg * Math.pow(0.5, elapsedHours / 5)`), rounded to the nearest integer.
- Sleep-Safe Countdown Estimator:** Calculates the hours required for Total Active Caffeine to drop below `50mg` (displaying "Sleep-safe in ~X.X hrs" when >= 50mg, or "Ready for sleep" when < 50mg).
- Daily Intake Limit Tracking: Sums `caffeineMg` for all drinks logged on the current calendar day against a `400mg` daily healthy limit with a visual progress bar that turns Crimson Red (`#DC2626`) when exceeded.
- Quick-Select Presets & Custom Logging: Allows users to either tap 1 of 4 preset drinks (`Espresso 65mg`, `Americano 95mg`, `Matcha Latte 70mg`, `Black Tea 45mg`) to auto-fill inputs, or enter a custom drink name and caffeine amount with input validation.
- History Management & Local Persistence: Persists all drink logs locally via `@react-native-async-storage/async-storage` under storage key `@caffeine_tracker_logs_v1`, supporting single-item deletion (`✕`) and bulk clearing (`Clear All` with confirmation alert).

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| Standard User | Single local user tracking personal daily caffeine consumption on their device. | Full local read, create, delete, and clear permissions for all drink logs. |

## Screens & Navigation

| Screen | Purpose | Navigation |
|--------|---------|------------|
| **Home Dashboard** (`src/app/index.tsx`) | Displays `"Caffeine Meter"` header, top Summary Card (Active Caffeine, Sleep-Safe Status, Today's Intake progress bar), scrollable `FlatList` of `"Drink History"` sorted newest-first (with `"Clear All"` button, individual `"Delete"` `✕` buttons, and empty state message), and bottom-anchored `"+ Log Caffeine"` primary button. | Initial root screen (`/`). Tapping `"+ Log Caffeine"` pushes to `/add`. |
| **Log Caffeine Screen** (`src/app/add.tsx`) | Displays `"Log Caffeine"` header, 2x2 grid of `"Quick Presets"` (`Espresso 65 mg`, `Americano 95 mg`, `Matcha Latte 70 mg`, `Black Tea 45 mg`), custom input form (Drink Name `TextInput` with placeholder `"e.g., Iced Latte"`, numeric Caffeine Amount `TextInput` with placeholder `"e.g., 120"`), validation handling, and full-width `"Save Drink"` button. | Reached from Home Dashboard. Back button returns to `/` without saving; `"Save Drink"` validates, persists to `AsyncStorage`, and navigates back to `/`. |

## Data Model

### Entities

### DrinkLog
Stored as a JSON-serialized array in `@react-native-async-storage/async-storage` under key `@caffeine_tracker_logs_v1`:
- `id`: `string` (unique timestamp or UUID)
- `name`: `string` (e.g., `"Americano"`)
- `caffeineMg`: `number` (integer > 0, e.g., `95`)
- `timestamp`: `number` (Unix timestamp in milliseconds when logged)

## API & Backend

- **Authentication:** None (single-user local app; no login required).
- **Database:** Local device storage only using `@react-native-async-storage/async-storage` (key: `@caffeine_tracker_logs_v1`).
- **Third-party APIs:** None.

## Design & Branding

*(Note: Color palette generated with AI assistance)*
- **Color palette:**
  - Primary Accent: Warm Espresso Brown (`#4A2C2A`)
  - Secondary / Highlight: Amber Gold (`#D97706`)
  - Background: Soft Cream (`#FAF8F5`)
  - Surface / Cards: Pure White (`#FFFFFF`)
  - Warning / Over-limit: Crimson Red (`#DC2626`)
- **Typography:** Clean, high-contrast system sans-serif fonts; large bold numeric display for Total Active Caffeine (e.g., `142 mg active`); clear section headers and readable timestamps (e.g., `2:30 PM`).
- **Style direction:** Warm, minimal, cafe-inspired utility aesthetic with rounded white cards (`#FFFFFF`) over a soft cream canvas (`#FAF8F5`), clear safe-area padding, and prominent tappable action buttons.

## Platform Targets

- [x] iOS (via Expo Go)
- [x] Android (via Expo Go)
- [ ] Web (out of scope / not targeted)

## Notifications & Background Tasks

- None. All metabolic decay calculations are computed dynamically on screen render/focus based on the stored `timestamp` and current system time (`Date.now()`).

## Offline Behavior

- **100% Offline-First:** The app requires zero internet connectivity to function. All reads, writes, deletions, and half-life calculations execute locally on the device via `AsyncStorage`.

## Analytics & Monitoring

- None (no third-party telemetry or crash reporting SDKs included).

## Constraints & Non-Goals

- **Tech Stack Constraints:** Must use Expo (matching the SDK version in `package.json`), Expo Router (`src/app/` directory), standard React Native `StyleSheet`, and `@react-native-async-storage/async-storage`.
- **Non-Goals:** No cloud sync, no user accounts, no push notifications, and no customizable half-life or daily limit settings in v1 (fixed at 5-hour half-life, 400mg daily limit, and 50mg sleep-safe threshold).

## Open Questions

- None — all calculation formulas, storage keys, UI copy, and edge cases are finalized below.

---

## Numbered Acceptance Criteria

1. **Navigation:** Launching the app opens `src/app/index.tsx` (`"Caffeine Meter"`). Tapping `"+ Log Caffeine"` navigates to `src/app/add.tsx` (`"Log Caffeine"`), and tapping the back button returns to the Home screen without adding data.
2. **Preset Auto-Fill:** On the Log Caffeine screen, tapping the `"Americano"` preset fills the Drink Name input with `"Americano"` and the Caffeine Amount input with `"95"`.
3. **Input Validation:** On the Log Caffeine screen, tapping `"Save Drink"` with an empty name or `0` / empty mg triggers a visible validation warning (`"Please enter a valid drink name and caffeine amount."`) and prevents saving.
4. **Adding & Updating Dashboard:** Entering `"Cold Brew"` and `"200"` and tapping `"Save Drink"` navigates back to the Home screen, adds `"Cold Brew"` (`200 mg`) to the top of the Drink History list, and updates Today's Intake to `200 / 400 mg`.
5. **Over-Limit Visual Indicator:** Logging drinks totaling more than `400 mg` today changes the Today's Intake progress indicator/text color to Crimson Red (`#DC2626`).
6. **Sleep-Safe Calculation:** When total active caffeine is above `50 mg` (e.g., right after logging `200 mg`), the summary card displays an estimated sleep-safe countdown in hours (e.g., `"Sleep-safe in ~10.0 hrs"`). When active caffeine is under `50 mg`, it displays `"Ready for sleep (< 50mg active)"`.
7. **Single Item Deletion:** Tapping the delete (`✕`) button on a specific drink item removes only that item from the list, updates the active/today totals immediately, and persists the deletion.
8. **Clear All Confirmation:** Tapping `"Clear All"` in the Drink History header displays a confirmation alert; confirming removes all stored logs, resets totals to `0`, and displays the empty state message (`"No drinks logged yet. Tap '+ Log Caffeine' to start tracking."`).
9. **Data Persistence Across Restarts:** After logging at least one drink, completely force-closing Expo Go and reopening the app restores the exact same drink list, active caffeine calculation, and today's intake total from `AsyncStorage`.