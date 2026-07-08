import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyCoS7NIBE6n40DSGSci-K6pkxvfDi-0HvE",
  authDomain: "dairy-manager-c98ed.firebaseapp.com",
  projectId: "dairy-manager-c98ed",
  storageBucket: "dairy-manager-c98ed.firebasestorage.app",
  messagingSenderId: "325092299254",
  appId: "1:325092299254:web:9d6498308da67ae84ef7d7"
};

// 1. Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore Database
const firestore = getFirestore(app);

// 3. Initialize Auth (with session persistence for Native devices)
let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

export { app, firestore, auth, firebaseConfig };
