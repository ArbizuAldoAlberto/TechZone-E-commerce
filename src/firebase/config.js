import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from 'firebase/auth'; // Auth with persistence
import { getFirestore } from 'firebase/firestore'; // Database
import AsyncStorage from '@react-native-async-storage/async-storage'; // Storage for persistence
import { Platform } from 'react-native';


// Firebase configuration
// TODO: Replace with actual project values from Firebase Console
// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// CRITICAL: Validate Config to prevent startup crash
const isConfigValid = !!firebaseConfig.apiKey;

let app;
let auth;

try {
    if (!isConfigValid) {
        console.error("🔥 FIREBASE CONFIG MISSING: App running in safe mode. Check .env variables.");
        // Initialize with dummy values to prevent 'undefined' crash, but Services will fail gracefully
        app = initializeApp({
            apiKey: "dummy-key",
            authDomain: "dummy.firebaseapp.com",
            projectId: "dummy-project"
        });
    } else {
        app = initializeApp(firebaseConfig);
    }

    if (Platform.OS === 'web') {
        auth = getAuth(app);
        auth.setPersistence(browserLocalPersistence);
    } else {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
    }

} catch (error) {
    console.error("🔥 FIREBASE INIT FAILED:", error);
    // Silent fail to allow app UI to render Error Boundary
}
const db = getFirestore(app);

export { auth, db };


