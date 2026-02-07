# TechZone: Elite E-Commerce Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

> **Experience the Future of Mobile Shopping.**
> TechZone is a premium, feature-rich e-commerce application built with React Native (Expo), Redux Toolkit, and Expo SQLite. It features offline support, 3D visualizations, and a sleek, glassmorphism-inspired UI.

---

## 🚀 Features

### 🌟 Core Experience
-   **Premium UI/UX**: Custom "Neo-Glass" design system, smooth animations (Reanimated), and 3D product interactions.
-   **Offline-First**: Browse previously cached products and place orders offline. They auto-sync when back online.
-   **Cross-Platform**: Optimized for Android, iOS, and Web.

### 🛍️ Shopping
-   **Dynamic Catalog**: Real-time product feed with category filtering and search.
-   **Smart Cart**: "The Purge" optimization handles abandoned items. Offline cart persistence via SQLite.
-   **Wishlist**: Save favorite items for later.
-   **Product 3D Viewer**: Interactive 3D models for featured products.

### 👤 User Features
-   **Authentication**: Secure login/signup flow.
-   **Profile Management**: Avatar customization and order history.
-   **Dark Mode**: Fully adaptive theme support.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React Native (Expo SDK 52)
-   **Language**: JavaScript (ES6+)
-   **Navigation**: React Navigation 7 (Native Stack + Bottom Tabs)
-   **State Management**: Redux Toolkit (RTK) + RTK Query
-   **UI Library**: Custom Component System (No external UI kits) + Reanimated 3

### Backend / Persistence
-   **API**: Firebase Realtime Database (via RTK Query)
-   **Local DB**: Expo SQLite (Next-Gen) for offline persistence
-   **Storage**: Async Storage (Preferences)

### Tools
-   **Build**: EAS Build (Expo Application Services)
-   **Linting**: ESLint + Prettier

---

## 📂 Project Structure

```bash
src/
├── app/               # App-wide services and hooks
├── components/        # Reusable UI components
│   ├── 3d/            # 3D models and scenes
│   ├── common/        # Buttons, inputs, alerts
│   ├── home/          # Home screen specific
│   ├── product/       # Product details specific
│   └── cart/          # Cart specific
├── db/                # SQLite database layer (The Sentinel)
├── navigation/        # Stack and Tab navigators
├── screens/           # Main application screens (Home, Cart, Profile, etc.)
├── services/          # RTK Query API definitions
├── store/             # Redux slices and store config
├── theme/             # Design tokens (Colors, Fonts, Spacing)
└── utils/             # Helper functions
```

---

## ⚡ Getting Started

### Prerequisites
-   Node.js (v18+)
-   Expo CLI (`npm install -g expo-cli`)
-   Android Studio / Xcode (for simulators)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/techzone.git
    cd techzone
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the app**
    ```bash
    npx expo start
    ```
    -   Press `a` for Android
    -   Press `i` for iOS
    -   Press `w` for Web

---

## 📦 Building for Production (APK)

This project uses **EAS Build** for generating release binaries.

1.  **Configure EAS**
    ```bash
    eas build:configure
    ```

2.  **Build for Android (APK)**
    ```bash
    eas build --platform android --profile preview
    # or local build
    eas build --platform android --profile preview --local
    ```

The output `app-release.apk` can be installed directly on Android devices.

---

## 🧪 Quality Assurance

-   **Code Quality**: Modularity is enforced via component extraction.
-   **Error Handling**: Global Error Boundary wraps the app to catch crashes.
-   **Performance**: `FlashList` and `useMemo` utilized for list optimization.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <b>TechZone Engineering</b>
</p>
