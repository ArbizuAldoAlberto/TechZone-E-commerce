import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import MainNavigator from './src/navigation/MainNavigator';
import { init } from './src/db';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SyncManager from './src/app/services/SyncManager';

export default function App() {

  useEffect(() => {
    init()
      .then(() => {
        // Database initialized successfully
      })
      .catch((err) => {
        // Database initialization failed - app will continue without local persistence
      });
  }, []);

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
