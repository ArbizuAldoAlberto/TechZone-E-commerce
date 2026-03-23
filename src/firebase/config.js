import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, browserLocalPersistence, setPersistence } from 'firebase/auth';
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
        console.error("🔥 FIREBASE CONFIG MISSING.");
        app = initializeApp({
            apiKey: "dummy-key",
            authDomain: "dummy.firebaseapp.com",
            projectId: "dummy-project"
        });
    } else {
        app = initializeApp(firebaseConfig);
    }

    auth = getAuth(app);
    
    const persistence = Platform.OS === 'web' 
        ? browserLocalPersistence 
        : getReactNativePersistence(AsyncStorage);
        
    setPersistence(auth, persistence).catch(err => {
        console.error("🔥 FIREBASE PERSISTENCE FAILED:", err);
    });

} catch (error) {
    console.error("🔥 FIREBASE INIT FAILED:", error);
}

const db = getFirestore(app);

export { auth, db };
