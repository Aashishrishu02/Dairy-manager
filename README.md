# 🐄 Dairy Manager App

A complete milk collection and billing app built with React Native (Expo).
Works **offline** — no internet needed after install.

---

## Features

| Feature | Done |
|---|---|
| Member registration (name, phone, village, cattle count) | ✅ |
| Daily milk entry (AM / PM sessions) | ✅ |
| Auto fat-based price calculation | ✅ |
| Edit fat rate table | ✅ |
| Today's collection view | ✅ |
| Monthly reports with totals | ✅ |
| Offline-first (SQLite on device) | ✅ |
| Android APK build | ✅ |

---

## Setup (one time)

### Requirements
- Node.js 18+
- A phone with Android 10+ OR Android emulator

### Install

```bash
# 1. Install dependencies
cd DairyApp
npm install

# 2. Start the development server
npx expo start

# 3. Scan QR code with Expo Go app on your phone
#    OR press 'a' to open Android emulator
```

### Build APK (to share on WhatsApp)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (free)
eas login

# Build APK
eas build --platform android --profile preview
```

The APK download link will appear in your terminal. Share it on WhatsApp — recipients tap it to install directly (no Play Store needed).

---

## App Structure

```
DairyApp/
├── App.tsx                    # Entry point, DB init
├── src/
│   ├── db/
│   │   └── database.ts        # All SQLite queries
│   ├── store/
│   │   └── useDairyStore.ts   # Global state (Zustand)
│   ├── utils/
│   │   └── theme.ts           # Colors, spacing, design tokens
│   ├── components/
│   │   └── UI.tsx             # Shared UI components
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Dashboard
│   │   ├── AddCollectionScreen.tsx # New milk entry
│   │   ├── TodayCollectionScreen.tsx # View today's entries
│   │   ├── MembersScreen.tsx       # Register & manage members
│   │   ├── ReportsScreen.tsx       # Monthly summaries
│   │   └── FatRatesScreen.tsx      # Edit fat price table
│   └── navigation/
│       └── AppNavigator.tsx   # Tab + Stack navigation
```

---

## Database Tables

| Table | Purpose |
|---|---|
| `members` | Milk supplier details |
| `collections` | Daily milk entries |
| `fat_rates` | Price table by fat % range |
| `payments` | Payment records |

---

## Fat Rate Table (default)

| Fat % | Rate (₹/L) |
|---|---|
| 3.0 – 3.4 | ₹22 |
| 3.5 – 3.9 | ₹24 |
| 4.0 – 4.4 | ₹26 |
| 4.5 – 4.9 | ₹28 |
| 5.0 – 5.4 | ₹30 |
| 5.5 – 5.9 | ₹32 |
| 6.0 – 6.4 | ₹35 |
| 6.5 – 6.9 | ₹38 |
| 7.0 – 7.4 | ₹42 |
| 7.5+ | ₹46 |

> Edit these inside the app → Rates tab. Changes only affect new entries.

---

## Adding Phase 4 features later

- **Cloud backup**: Add `firebase` package, sync `collections` table to Firestore
- **PDF bills**: Add `expo-print`, generate monthly bill per member
- **Hindi language**: Add `i18n-js` package, translate screen strings
- **Thermal printer**: Use `react-native-bluetooth-escpos-printer`
