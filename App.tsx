import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDB } from './src/db/database';
import { useDairyStore } from './src/store/useDairyStore';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const { refreshMembers } = useDairyStore();

  useEffect(() => {
    // Initialize database on first launch
    initDB();
    refreshMembers();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
