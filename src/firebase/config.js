import { initializeApp } from 'firebase/app';
import { 
    initializeAuth, 
    getReactNativePersistence, 
    browserLocalPersistence, 
    getAuth 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const isConfigValid = !!firebaseConfig.apiKey;

let app;
let auth;

try {
    if (!isConfigValid) {
        console.warn("🔥 FIREBASE CONFIG MISSING. Using dummy init.");
        app = initializeApp({
            apiKey: "dummy-key",
            authDomain: "dummy.firebaseapp.com",
            projectId: "dummy-project"
        });
        auth = getAuth(app);
    } else {
        app = initializeApp(firebaseConfig);
        
        // Initialize Auth with persistence based on Platform
        auth = initializeAuth(app, {
            persistence: Platform.OS === 'web' 
                ? browserLocalPersistence 
                : getReactNativePersistence(AsyncStorage)
        });
    }

} catch (error) {
    console.error("🔥 FIREBASE INIT FAILED:", error);
    // Fallback to basic auth if initialization fails
    if (!auth) auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
