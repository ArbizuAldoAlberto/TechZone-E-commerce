import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import MainNavigator from './src/navigation/MainNavigator';
import { init } from './src/db';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SyncManager from './src/app/services/SyncManager';
import { useFonts, Cormorant_400Regular, Cormorant_500Medium, Cormorant_600SemiBold, Cormorant_700Bold } from '@expo-google-fonts/cormorant';
import { Montserrat_300Light, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';

// Attempt to prevent auto hide, but don't crash if it fails
try {
  SplashScreen.preventAutoHideAsync().catch(() => { });
} catch (e) {
  console.warn("SplashScreen preventAutoHideAsync error", e);
}

/**
 * @component App
 * @description Application Entry Point.
 */
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Cormorant: Cormorant_700Bold,
    'Cormorant-Regular': Cormorant_400Regular,
    'Cormorant-Medium': Cormorant_500Medium,
    'Cormorant-SemiBold': Cormorant_600SemiBold,
    'Cormorant-Bold': Cormorant_700Bold,
    Montserrat: Montserrat_400Regular,
    'Montserrat-Light': Montserrat_300Light,
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await init(); // 1. Init DB
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true); // 2. Mark Ready
      }
    }
    prepare();
  }, []);

  // Hide splash only when Fonts AND DB are ready
  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SyncManager>
          <MainNavigator />
        </SyncManager>
      </SafeAreaProvider>
    </Provider>
  );
}
