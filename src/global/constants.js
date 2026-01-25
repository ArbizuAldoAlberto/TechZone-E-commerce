// Firebase configuration
// In production, use react-native-dotenv or expo-constants for secure config

/**
 * @constant BASE_URL
 * @description The base URL for the Firebase Realtime Database.
 * Used by Redux Toolkit Query services (shopApi, userApi).
 */
export const BASE_URL = process.env.EXPO_PUBLIC_FIREBASE_URL;

