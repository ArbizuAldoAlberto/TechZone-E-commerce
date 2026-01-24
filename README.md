# TechZone - Premium E-commerce Mobile Application

![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue?logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.11-764ABC?logo=redux)
![SQLite](https://img.shields.io/badge/SQLite-Offline_First-003B57?logo=sqlite)
![Firebase](https://img.shields.io/badge/Firebase-Auth_%2B_Realtime_DB-FFCA28?logo=firebase)
![Clean Architecture](https://img.shields.io/badge/Architecture-Clean_%26_Scalable-success)

TechZone is a robust, professional **Offline-First** E-commerce application built with React Native and Expo. Developed with a **Senior Architecture** approach, it prioritizes scalability, offline synchronization, and a premium user experience.

---

## 🚀 Key Features

### 🌟 Advanced User Experience
- **Interactive Map Selection**: Users can precisely pinpoint their delivery location using a draggable pin map interface.
- **Dark/Light Theme**: System-wide theme toggle with smooth transitions.
- **Dynamic Shop**: Category-based filtering powered by **Firebase Realtime Database**.
- **Real-Time Validation**: Instant feedback on forms using **React Hook Form + Yup**.

### ⚡ Performance & Reliability
- **Offline-First Architecture**: Add products to cart without internet - syncs automatically when connection recovers.
- **Session Persistence**: SQLite auto-login on app restart.
- **Optimistic Updates**: UI updates immediately while data syncs in the background.

### 📱 Device Integration
- **Camera + Gallery**: Profile photo management with automatic image compression (`expo-image-manipulator`).
- **Location Services**: GPS tracking with reverse geocoding to auto-fill addresses.

---

## 🏗️ Clean Project Architecture

The project follows a modular, feature-based structure designed for maintainability:

```
TechZone/
├── App.js                    # Entry point & DB Initialization
├── src/
│   ├── app/                  # App-wide logic (SyncManager)
│   ├── components/           # Reusable UI (Atomic Design)
│   │   ├── common/           # Buttons, Inputs, Alerts
│   │   └── profile/          # Feature-specific components (LocationPicker)
│   ├── db/                   # SQLite persistence layer
│   ├── global/               # Design tokens (colors, fonts)
│   ├── hooks/                # Custom Logic Hooks (useImagePicker, useUserLocation)
│   ├── navigation/           # Navigation Stacks & Tabs
│   ├── screens/              # View Layer (Profile, Auth, Shop)
│   ├── services/             # API & Business Logic (RTK Query)
│   ├── store/                # Global State (Redux Slices)
│   └── utils/                # Helpers & Validators (Yup Schemas)
```

---

## 🔄 Offline-First Synchronization Flow

```mermaid
graph LR
    User[User Action] --> Redux[Redux Store]
    Redux --> UI[Update UI]
    Redux --> Check{Online?}
    Check -->|Yes| Firebase[Firebase DB]
    Check -->|No| SQLite[SQLite (Pending Queue)]
    SQLite --> Sync[SyncManager]
    Sync -->|Connection Restored| Firebase
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (LTS)
- Expo CLI & EAS CLI

### Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd TechZone
   npm install
   ```

2. **Environment Configuration**
   Create `.env` in the root directory:
   ```env
   EXPO_PUBLIC_FIREBASE_URL=https://your-project.firebaseio.com/
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   ...
   ```

3. **Run the App**
   ```bash
   npx expo start
   ```

---

## 📦 Deep Tech Stack

| Category | Technology |
|----------|------------|
| **Core** | React Native 0.81.5, Expo 54, React 19 |
| **State** | Redux Toolkit, RTK Query |
| **Persistence** | expo-sqlite (ACID), AsyncStorage |
| **Backend** | Firebase Auth (REST), Realtime Database |
| **Maps** | react-native-maps, expo-location |
| **Forms** | React Hook Form, Yup Validation |
| **UI/UX** | React Native Animated, Vector Icons |

---

## ✅ Recent Enhancements (v1.1)

| Feature | Description | Status |
|---------|-------------|--------|
| **Smart Location** | Interactive map modal for precise address selection | ✅ |
| **Clean Hooks** | Extracted logic: `useImagePicker`, `useUserLocation` | ✅ |
| **Robust Auth** | Centralized validation schemas for Login/Register | ✅ |
| **Map Upgrade** | Migrated from static images to `react-native-maps` | ✅ |

---

## 📄 License
MIT License. **Made with ❤️ using React Native & Expo**
