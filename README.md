# TechZone 📱

<div align="center">

  ![Banner](./assets/techzone-banner.png)


  **Tu destino definitivo para la tecnología móvil.**
  
  [![Expo](https://img.shields.io/badge/Expo-sdk__52-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React_Native-v0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
  [![Redux Toolkit](https://img.shields.io/badge/Redux-Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
  [![Firebase](https://img.shields.io/badge/Firebase-Backend-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com)
  [![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 🚀 Sobre el Proyecto

**TechZone** es una aplicación de E-commerce moderna y robusta, desarrollada como proyecto final para el curso "Desarrollo de Aplicaciones" en Coderhouse. 

La aplicación permite a los usuarios navegar por un catálogo de productos tecnológicos, gestionar un carrito de compras persistente, realizar pedidos y gestionar su perfil de usuario con integración de hardware nativo.

### 🌟 Features Principales

| Módulo | Descripción |
| :--- | :--- |
| **🔐 Autenticación** | Flujo completo de Login/Registro con Firebase Auth. Manejo de sesiones persistentes. |
| **� Shop & Orders** | Catálogo de productos con categorías, Detalle de Producto, Carrito de Compras (Redux) e historial de Órdenes. |
| **� Persistencia** | Base de datos local SQLite para guardar sesiones y preferencias del usuario offline. |
| **📍 Location Services** | Integración con mapas para visualizar y confirmar la dirección de envío del usuario. |
| **📸 Perfil Multimedia** | Selector de imágenes nativo para que el usuario suba o tome una foto de perfil. |

---

## 📸 Galería de Pantallas

| Autenticación | Home & Catálogo | Carrito & Checkout | Perfil & Mapa |
|:---:|:---:|:---:|:---:|
| ![Login](https://via.placeholder.com/200x400?text=Login) | ![Home](https://via.placeholder.com/200x400?text=Home) | ![Cart](https://via.placeholder.com/200x400?text=Cart) | ![Profile](https://via.placeholder.com/200x400?text=Profile) |

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura profesional y escalable:

```bash
TechZone/
├── 📂 src/
│   ├── 📂 app/             # Configuración del store (Redux)
│   ├── 📂 components/      # UI Kit reutilizable (Input, Button, Cards)
│   ├── 📂 db/              # Capa de persistencia local (SQLite)
│   ├── 📂 firebase/        # Configuración de base de datos remota
│   ├── 📂 global/          # Fuentes y estilos globales
│   ├── 📂 hooks/           # Custom Hooks
│   ├── 📂 navigation/      # Stacks (Auth, Shop) y Tabs (Main)
│   ├── 📂 screens/         # Vistas: Auth, Cart, Home, Orders, ProductDetail, Profile
│   ├── 📂 services/        # API Calls (RTK Query para Firebase)
│   └── 📂 utils/           # Funciones auxiliares y validaciones
├── 📄 App.js               # Entry Point
├── 📄 app.json             # Configuración de Expo, Permisos y Plugins
└── 📄 package.json         # Dependencias
```

---

## ⚙️ Instalación (Developer Guide)

### Prerrequisitos
- Node.js & npm
- Expo Go (Móvil) o Emulador Android/iOS

### Pasos
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/TU_USUARIO/TechZone.git
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` copiando el template incluído:
    ```bash
    cp .env.example .env
    ```
    *Rellena las claves con tu configuración de Firebase Console.*

4.  **Iniciar la App:**
    ```bash
    npx expo start
    ```

---

## 🗺️ Roadmap & Futuras Mejoras

- [x] **MVP:** Catálogo, Carrito, Auth, SQLite, Maps, Camera.
- [ ] **Pagos:** Integración con MercadoPago / Stripe.
- [ ] **Notificaciones:** Push Notifications para estado de órdenes.
- [ ] **Admin:** Panel web para gestión de productos.

---

## 🤝 Contributing

1.  Fork del repositorio.
2.  Crea tu rama (`git checkout -b feature/AmazingFeature`).
3.  Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---

## 📝 Licencia

Distribuido bajo la Licencia [MIT](LICENSE).

---
<div align="center">
  <p>Desarrollado por <b>Aldo Arbizu</b> para <b>Coderhouse</b> - 2026</p>
</div>

---
