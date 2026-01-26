/**
 * @fileoverview Application Constants
 * @description Centralized configuration values for the TechZone app.
 */

/**
 * @constant BASE_URL
 * @description Firebase Realtime Database base URL for RTK Query services.
 * Sourced from environment variables via Expo's dotenv support.
 */
export const BASE_URL = process.env.EXPO_PUBLIC_FIREBASE_URL;
