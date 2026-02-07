import 'dotenv/config';

export default {
    expo: {
        name: "TechZone",
        slug: "techzone-feature",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#007AFF"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.techzone.app",
            infoPlist: {
                NSCameraUsageDescription: "TechZone needs camera access to take profile photos",
                NSPhotoLibraryUsageDescription: "TechZone needs photo library access to select profile pictures",
                NSLocationWhenInUseUsageDescription: "TechZone needs your location to show nearby stores and delivery options"
            },
            config: {
                googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#007AFF"
            },
            edgeToEdgeEnabled: true,
            package: "com.techzone.app",
            permissions: [
                "android.permission.CAMERA",
                "android.permission.READ_EXTERNAL_STORAGE",
                "android.permission.WRITE_EXTERNAL_STORAGE",
                "android.permission.ACCESS_FINE_LOCATION",
                "android.permission.ACCESS_COARSE_LOCATION",
                "android.permission.INTERNET",
                "android.permission.ACCESS_NETWORK_STATE",
                "android.permission.RECORD_AUDIO"
            ],
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
                }
            }
        },
        web: {
            favicon: "./assets/favicon.png",
            bundler: "metro"
        },
        plugins: [
            "expo-sqlite",
            "expo-font",
            [
                "expo-location",
                {
                    "locationAlwaysAndWhenInUsePermission": "Allow TechZone to use your location to find nearby stores."
                }
            ],
            [
                "expo-image-picker",
                {
                    "photosPermission": "Allow TechZone to access your photos for profile pictures.",
                    "cameraPermission": "Allow TechZone to use your camera to take profile photos."
                }
            ]
        ],
        extra: {
            eas: {
                "projectId": "82798495-c977-44ec-8208-0443e7422e3f"
            }
        }
    }
};
