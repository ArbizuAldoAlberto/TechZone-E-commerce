# TechZone 📱

<div align="center">

  ![Banner](./assets/techzone-banner.png)

  **Tu destino definitivo para la tecnología móvil.**
  
  [![Expo](https://img.shields.io/badge/Expo-sdk__52-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React_Native-v0.76-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
  [![Redux Toolkit](https://img.shields.io/badge/Redux-Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
  [![Firebase](https://img.shields.io/badge/Firebase-Backend-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com)
  [![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 🚀 Sobre el Proyecto

**TechZone** es una aplicación de E-commerce moderna y robusta, diseñada para ofrecer una experiencia de usuario premium en dispositivos móviles. Integrando tecnologías de vanguardia como **React Native**, **Expo Ecosystem** y **Firebase**, TechZone demuestra la implementación de patrones de diseño profesionales y una arquitectura escalable.

El proyecto abarca desde la autenticación segura y persistencia de datos local, hasta la integración de hardware nativo y visualización de productos en 3D.

### 🌟 Key Features

| Módulo | Descripción |
| :--- | :--- |
| **🔐 Auth & Security** | Autenticación robusta con Firebase Auth, persistencia de sesión segura y manejo de errores amigable. |
| **🛍️ Shop Experience** | Catálogo dinámico, filtrado avanzado, búsqueda en tiempo real y visualización de productos con modelos 3D interactivos (`Three.js`). |
| **📦 Order Management** | Carrito de compras persistente con Redux, checkout fluido y generación de órdenes en tiempo real. |
| **💾 Smart Persistence** | Base de datos local SQLite para caché de usuario, preferencias y funcionamiento offline-first. |
| **📍 Native Integration** | Uso de Maps para geolocalización de envíos y Camera/Gallery para personalización de perfil. |

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura **Feature-First / Modular** para facilitar la escalabilidad:

```bash
TechZone/
├── 📂 src/
│   ├── 📂 app/             # Configuración del store (Redux Toolkit)
│   ├── 📂 components/      # UI Kit reutilizable (Átomic Design)
│   │   ├── 📂 3d/          # Componentes Three.js (Hero, Modelos)
│   │   ├── 📂 common/      # Inputs, Loaders, Modals
│   │   └── 📂 ui/          # Elementos de diseño base (Glassmorphism)
│   ├── 📂 db/              # Capa de persistencia local (SQLite)
│   ├── 📂 firebase/        # Configuración de servicios backend
│   ├── 📂 features/        # Lógica de negocio específica (futuro refactor)
│   ├── 📂 navigation/      # Manejo de rutas (Stacks, Tabs, Drawers)
│   ├── 📂 screens/         # Vistas principales de la aplicación
│   ├── 📂 services/        # API Calls (RTK Query endpoints)
│   └── 📂 theme/           # Sistema de diseño centralizado (Colors, Fonts)
├── 📄 App.js               # Entry Point & Configuración Global
├── 📄 app.json             # Manifiesto de Expo
└── 📄 package.json         # Dependencias del proyecto
```

---

## ⚙️ Guía de Instalación

Sigue estos pasos para desplegar el proyecto en tu entorno local:

### Prerrequisitos
- **Node.js** (v18 o superior)
- **Expo CLI**: `npm install -g expo-cli`
- **Dispositivo Físico** (Expo Go app) o **Emulador** (Android Studio / Xcode)

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/ArbizuAldoAlberto/TechZone.git
    cd TechZone
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    El proyecto requiere claves de API para Firebase y Google Maps.
    *   Crea un archivo `.env` en la raíz del proyecto.
    *   Copia el contenido de `.env.example`:
        ```bash
        cp .env.example .env
        ```
    *   Rellena las variables con tus credenciales de [Firebase Console](https://console.firebase.google.com/).

4.  **Iniciar el Servidor de Desarrollo:**
    ```bash
    npx expo start
    ```
    *   Presiona `a` para abrir en Android Emulator.
    *   Presiona `i` para abrir en iOS Simulator.
    *   Escanea el QR con Expo Go en tu dispositivo físico.

---

## 🤝 Contributing

Este es un repositorio privado, pero las contribuciones del equipo son bienvenidas bajo el siguiente flujo:

1.  Crea un **Fork** del repositorio.
2.  Crea tu rama de feature (`git checkout -b feature/AmazingFeature`).
3.  Realiza tus cambios y haz **Commit** (`git commit -m 'feat: Add some AmazingFeature'`).
4.  Haz **Push** a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un **Pull Request** hacia `main`.

---

## 📝 Licencia

Este proyecto es propiedad privada y confidencial.
Copyright © 2026 Aldo Arbizu. Todos los derechos reservados.

---
<div align="center">
  <p>Construido con ❤️ y React Native</p>
</div>

