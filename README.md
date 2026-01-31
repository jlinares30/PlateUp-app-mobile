# 🍽️ PlateUp - Nutrition & Meal Planning App

A full-stack mobile application designed to help users plan meals, manage recipes, and track their nutrition journey. Built with **React Native (Expo)** and **Node.js**.

---

## 🚀 Overview

**PlateUp** solves the problem of disorganized meal planning. It allows users to:
- Browse, create, and manage their own recipes.
- Plan meals for the week with a drag-and-drop or selection interface.
- Automatically generate shopping lists based on meal plans.
- Manage pantry inventory to avoid waste.
- Filter recipes by ingredients, difficulty, and categories.

This project demonstrates proficiency in **full-stack mobile development**, **state management**, **RESTful API design**, and **modern UI/UX principles**.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Secure Login/Register**: JWT-based authentication with encrypted passwords (bcrypt).
- **Email Verification**: Custom backend validation ensuring email domain existence via DNS MX records.
- **Profile Management**: Update user details and upload profile pictures.

### 🥗 Recipe Management
- **CRUD Operations**: Create, read, update, and delete recipes.
- **Image Upload**: Seamless image uploading using camera/gallery integration and **Cloudinary** storage.
- **Rich Details**: Support for ingredients, step-by-step instructions, preparation time, and difficulty levels.
- **Favorites**: Save best-loved recipes for quick access.

### 📅 Meal Planning
- **Weekly Planner**: Organize breakfast, lunch, dinner, and snacks for each day.
- **Flexible Management**: Create public or private meal plans.

### 🛒 Shopping & Pantry
- **Smart Shopping List**: Add ingredients directly from recipes.
- **Pantry Tracker**: Keep track of what you already have at home.

---

## 🛠️ Tech Stack

### 📱 Frontend (Mobile)
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (Managed Workflow)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Global Store)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (Caching, optimistic updates)
- **Styling**: Custom StyleSheet with responsive design constants.
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **UI Components**: lucide-react-native (Icons), RefreshControl, FlatLists.

### 🔙 Backend (API)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Custom regex & DNS domain verification.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Instance (Local or Atlas)
- Cloudinary Account (for images)

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` root:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend/app-mobile-prototype-react-native
npm install
```

Create a `.env` file (if needed by your config, usually EXPO public vars):
```env
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000/api
EXPO_PUBLIC_API_URL_PROD=https://your-prod-api.com/api
```

Start the Expo app:
```bash
npx expo start
```
*Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code with Expo Go.*

---

## 📂 Project Structure

```
├── app/                  # Frontend Screens & Routing (Expo Router)
│   ├── (app)/            # Authenticated Routes (Tabs, Stacks)
│   ├── (auth)/           # Authentication Routes (Login, Register)
│   ├── _layout.tsx       # Root Layout
├── src/
│   ├── components/       # Reusable UI Components (Cards, Modals)
│   ├── constants/        # Theme, Colors, Fonts
│   ├── lib/              # Utilities & API Configuration
│   ├── store/            # Zustand Stores (Auth, etc.)
│   ├── types/            # TypeScript Interfaces
├── backend/
│   ├── controllers/      # Logic for API endpoints
│   ├── models/           # Mongoose Data Schemas
│   ├── routes/           # API Route Definitions
│   ├── config/           # Database & Cloudinary Config
```

---

## � Security & Session Management

### 🔒 Session Management & Persistence (Android)
During the development of PlateUp, an unexpected behavior was identified where the user session persisted even after clearing the cache or reinstalling the application. This issue was resolved through advanced persistence configuration and Android security policies.

#### 🛠️ Problem: "Phantom" Persistence
Due to Google's Auto Backup feature, data stored in AsyncStorage (managed by Zustand's persist middleware) was automatically backed up to the cloud. This caused the system to restore the old authentication token upon reinstalling the APK, allowing access to the Dashboard without a prior login.

#### ✅ Implemented Solution
1. **Disable Auto Backup**: The application manifest was configured to prevent saving sensitive data in backups not encrypted by the developer.

```json
// app.json
"android": {
  "allowBackup": false
}
```

2. **Hydration & State Validation**: A "Hydration Guard" was implemented in the root component (RootLayout) using Zustand's `onRehydrateStorage`. This ensures that redirect logic only executes once the app has confirmed the integrity of local data.

3. **Backend Synchronization**: A response interceptor was added in Axios to handle 401 Unauthorized errors. If the server rejects the token (due to expiration or invalidity), the app automatically executes a `logout()` to clear local state and redirect the user to the login screen.

---

## �💡 Future Improvements
- [ ] **Social Sharing**: Share meal plans with friends.
- [ ] **Nutritional Analysis**: Auto-calculate calories and macros based on ingredients.
- [ ] **Offline Mode**: Cache recipes for offline access.
- [ ] **Push Notifications**: Reminders for meal prep times.

---

## 👤 Author
Developed by **Jorge Linares**.
