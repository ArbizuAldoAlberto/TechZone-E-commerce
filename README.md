# ⚡ TechZone: Elite E-Commerce Solution (Sentinel V2.1)

![TechZone Banner](./assets/techzone-banner.png)

> **TechZone** is a high-performance, **Offline-First** mobile commerce platform built with **React Native (Expo)**. It integrates advanced synchronization logic, 3D product visualization, and an elite Glassmorphism UI to provide an industry-standard shopping experience.

---

## 🚀 Key Engineering Highlights

### 🛡️ Sentinel Sync Engine (V2.1)
The core of TechZone is its custom **Sentinel Sync Engine**, designed for maximum resilience in low-connectivity environments:
- **Offline Mutation Queue:** All user actions (Cart updates, Orders, Profile edits) are queued in a local **SQLite** database if the network is unavailable.
- **Automatic Background Sync:** A headless `SyncManager` monitors connectivity via `NetInfo` and automatically flushes the mutation queue once a stable connection is restored.
- **Conflict Resolution & Idempotency:** Implements a retry-and-purge strategy with `MAX_RETRIES` to handle transient network failures gracefully.

### 💾 Hybrid Persistence Layer
TechZone uses a dual-layer strategy for data integrity:
1.  **Firebase (Auth/Firestore/RTD):** Distributed cloud backend for real-time synchronization.
2.  **SQLite (Expo-SQLite):** Local source of truth for sessions, cart items, and order history caching.
3.  **Redux Toolkit (RTK Query):** Advanced state management and caching with automatic re-validation of data.

### 🎨 Elite UI/UX & Graphics
- **3D Product Viewing:** Immersive 3D product previews using custom GL-based viewers.
- **Glassmorphism Design:** Sophisticated UI layers with blur effects and transparency for a modern, "Elite" look.
- **Reanimated 3.0:** Fluid layouts and physics-based animations throughout the navigation flow.

---

## 🛠️ Technical Stack

- **Framework:** [React Native](https://reactnative.dev/) (Expo SDK 51)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) + [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- **Backend:** [Firebase](https://firebase.google.com/) (Auth, Realtime Database, Firestore)
- **Database:** [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Local Persistence)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Lottie](https://lottiereactnative.com/)
- **Styling:** Centralized Theming with Dark Mode support.

---

## 📂 Project Architecture (Clean & Modular)

```text
src/
├── app/             # Application Core (Hooks, SyncManager, Context)
├── components/      # UI Components (3D, Common, Feature-specific)
├── db/              # SQLite Database Schema & Persistence Layer
├── firebase/        # Firebase Initialization & Cloud Config
├── global/          # App-wide Constants, Colors, and Fonts
├── navigation/      # React Navigation Stacks & Tab Controllers
├── screens/         # Feature Screens (Auth, Home, Cart, Orders, Profile)
├── services/        # RTK Query API Services (Shop, User, Auth)
├── store/           # Redux Slices & Global State Store
└── utils/           # Business Logic, Sanitization & Validations
```

---

## ⚙️ Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/ArbizuAldoAlberto/TechZone-E-commerce.git
    cd TechZone-E-commerce
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
    EXPO_PUBLIC_FIREBASE_URL=your_database_url
    ...
    ```

4.  **Run the App:**
    ```bash
    npx expo start
    ```

---

## 👤 Author & Contributions

**Aldo Arbizu Alberto** - *Lead Software Engineer / Architect*

- GitHub: [@ArbizuAldoAlberto](https://github.com/ArbizuAldoAlberto)
- Portfolio: [Insert Portfolio Link]
- LinkedIn: [Insert LinkedIn Link]

---

## 📜 License & Security

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
**Security Note:** All sensitive credentials are managed via Expo environment variables and are never committed to the repository.

---
*Developed by Antigravity Studio — SO v7.1 Compliance*
