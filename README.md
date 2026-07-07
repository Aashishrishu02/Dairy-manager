# 🐄 Dairy Manager — Milk Collection & Billing App

A premium, production-ready, offline-first mobile application built with **React Native (Expo)**, **TypeScript**, and **SQLite** to streamline daily milk collection, fat-based price calculations, payouts, and billing statements.

---

## 📌 Repository Tagline / Description
> A premium, offline-first Milk Collection & Billing mobile app built with React Native (Expo), TypeScript, and SQLite. Features real-time fat-based price calculation, thermal receipt printing, Firebase cloud sync, monthly PDF billing statements, and bilingual (English/Hindi) support.

---

## ✨ Key Features

* **👥 Supplier Directory**: Register suppliers with village names, phone numbers, cattle counts, and record advance balances with auto-deductions.
* **🥛 Daily Collection Entry**: Record milk entries for Morning (AM) and Evening (PM) sessions with auto-calculated rates based on fat percentages.
* **📈 Premium Live Pricing**: Dynamic calculation using customizable fat rate tables supporting fat values up to `15.0%`.
* **🖨️ Thermal Receipt Printing**: Instantly print collections or share formatted 58mm receipts with suppliers via Bluetooth or WiFi thermal printers.
* **📊 Monthly billing statements**: Compile payouts, averages, and collections into a highly professional, printable PDF document per supplier.
* **☁️ Cloud Backup**: Sync local SQLite databases securely to **Firebase Firestore** with robust batch writes to prevent data loss.
* **🌐 Bilingual Support**: Seamlessly toggle between **English** and **Hindi (हिन्दी)** translations.
* **📱 Premium UI/UX**: Designed around a sleek emerald green visual language with floating cards, clean stats, and glassmorphic elements.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React Native (Expo SDK 51)
* **Programming Language**: TypeScript
* **State Management**: Zustand
* **Database**: Expo-SQLite (Offline-first)
* **Cloud Sync**: Firebase JS SDK (Firestore)
* **PDF & Printing**: Expo-Print & Expo-Sharing
* **Date Utilities**: date-fns

---

## 📁 Project Structure

```
DairyApp/
├── App.tsx                    # Main entry point (DB init & app routing)
├── app.json                   # Expo configurations & package metadata
├── eas.json                   # EAS CLI cloud configuration (APK output)
├── assets/                    # App icons, splash screens & graphics
└── src/
    ├── db/
    │   └── database.ts        # SQLite DB queries & Web MockDatabase fallback
    ├── store/
    │   └── useDairyStore.ts   # Zustand global state management
    ├── utils/
    │   ├── theme.ts           # Emerald theme colors, typography, & tokens
    │   ├── i18n.ts            # Translation dictionaries (EN/HI)
    │   ├── pdfGenerator.ts    # PDF statements & thermal receipt generation
    │   └── firebaseSync.ts    # Firestore cloud backup batch syncing
    ├── components/
    │   └── UI.tsx             # Shared premium UI controls (Card, Badge, Button)
    └── screens/
        ├── HomeScreen.tsx          # Main metrics & quick actions dashboard
        ├── AddCollectionScreen.tsx # Milk collection input & receipt printing
        ├── TodayCollectionScreen.tsx # Filtered daily collection registry
        ├── MembersScreen.tsx       # Supplier management & directories
        ├── ReportsScreen.tsx       # Monthly statements & PDF billing exporter
        └── FatRatesScreen.tsx      # Pricing guidelines & Firebase sync portal
```

---

## 🚀 Setting Up Locally

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/Aashishrishu02/Dairy-Manager.git
cd Dairy-Manager
npm install
```

### 2. Run the Development Server
Start the Expo bundler:
```bash
npx expo start
```
* **Press `w`** to open the preview in your Web Browser (uses the `localStorage` fallback DB).
* **Press `a`** to open on an Android emulator.
* **Scan the QR Code** with the **Expo Go** application on your physical device.

---

## 📦 Compiling Android APK

To build a standalone Android installer APK:
1. Ensure you have the EAS CLI installed and are logged into Expo:
   ```bash
   npm install -g eas-cli
   npx eas login
   ```
2. Build the preview package:
   ```bash
   npm run build:apk
   ```
   *The download link for the `.apk` file will be provided in your terminal once the cloud build completes.*
