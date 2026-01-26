**
 * @fileoverview Firebase Configuration Template
    * @description Safe template for Firebase connectivity.
 * INSTRUCTIONS:
 * 1. Copy this file to 'src/firebase/config.js'
    * 2. Replace the empty strings with your actual Firebase Console keys.
 * 3. Never commit the actual 'config.js' file to Git.
 */

import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚨 REPLACE WITH YOUR KEYS
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "00000000000",
    appId: "1:00000000:web:0000000000"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
