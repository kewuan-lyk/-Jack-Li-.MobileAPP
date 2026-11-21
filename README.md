# Caffeine Meter



# Overview
A simple mobile application built with React Native and Expo (using Expo Router) that helps coffee and tea drinkers track their daily caffeine intake and monitor how much caffeine remains active in their body. The app provides an immediate visual status of daily consumption against a 400mg healthy limit and estimates when active caffeine will decay below a sleep-safe threshold (50mg). I chose this topic because caffeine is part of many people's daily routine, but it is difficult to estimate its remaining effects and possible impact on sleep from memory alone.

## Home Dashboard

The Home Dashboard gives user an overview of their caffeine intake. It displays the estimated active caffeine in the body, the time remaining until it falls below the sleep-safe threshold and today's progress toward the 400 mg limit.
The screen also shows saved drinks in newest-first order and lets the user delete one record, clear the full history, or open the logging screen.

## Log Caffeine

The Log Caffeine screen lets the user choose one of four common drink presets or enter a custom drink name and caffeine amount. Selecting a preset automatically fills both fields. The app checks the input before saving, stores a valid drink locally, and then returns to the Home Dashboard with updated totals and history.




# Technology and test environment

- Expo SDK: 58.0.26 (SDK 58)
- Expo Router: 58.0.32
- React Native: *.88.1
- Local storage: `@react-native-async-storage/async-storage` **2.2.0**
- Development environment used for the recorded demonstration: **Google Chrome with the Expo local web preview at a mobile-sized window**
- Native build verification: the project was successfully bundled locally for both iOS and Android with `expo export`

## Installation

From the repository root:

```bash
cd JackMobileAPP
npm install
```

## Run the same Chrome preview used for the demonstration

```bash
npx expo start --web
```

Open the local URL printed by Expo, normally `http://localhost:8081`.

## Run with Expo Go

```bash
cd JackMobileAPP
npx expo start
```

Install the free Expo Go app on an iOS or Android device, keep the device and computer on the same network, and scan the QR code printed by Expo.

## Run with an installed simulator or emulator

Start the project with `npx expo start`, then press:

- `i` for an installed iOS Simulator
- `a` for an installed Android Emulator

## Project checks

```bash
npx eslint .
npx tsc --noEmit
npx expo-doctor
npx expo export --platform ios
npx expo export --platform android
```

## Something that surprised me about mobile development

One thing that surprised me was how much a mobile interface depends on details outside the main visual design. Safe areas, notches, the home indicator, and the software keyboard can all cover important content unless every screen is deliberately structured around them.

## Project documentation

- The implementation specification is in `SPEC.md`.
- The independent implementation review is in `JackMobileAPP/REVIEW.md`.


This Project used Codex AI to generate the application and checking the requirement for SPEC.md. Also, Codex is used to ensure the structure and content accuracy of REVIEW.md and README.md
