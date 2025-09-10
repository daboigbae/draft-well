# Linkedraft - LinkedIn Post Manager

A full-stack web application for writing and managing LinkedIn posts with draft/published tracking, built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- **Authentication**: Firebase Auth with Email/Password and Google Sign-In
- **Post Management**: Complete CRUD operations for LinkedIn posts
- **Rich Editor**: Markdown editor with live preview
- **Character Counter**: LinkedIn's 3000 character limit with soft warning at 2600
- **Post Actions**: Copy to clipboard, duplicate, and export as .txt
- **Auto-save**: Debounced auto-save with optimistic UI
- **Filtering & Search**: Filter by status (All, Drafts, Scheduled, Published) and search posts
- **Scheduling**: Schedule posts for future publication
- **Real-time Updates**: Live updates through Firestore subscriptions

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui components
- **Backend**: Firebase (Auth + Firestore)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Markdown**: Marked.js for parsing and rendering

## Project Structure

This is a client-side Firebase application with no backend server required:

### 📁 `client/` - Frontend Application
The React frontend application built with Vite:
- **`src/`** - Main source code
  - **`components/`** - Reusable React components
    - **`ui/`** - shadcn/ui component library (buttons, dialogs, forms, etc.)
    - Other custom components (AuthGuard, PostCard, EditorToolbar, etc.)
  - **`pages/`** - Route-based page components (Editor, PostList, Settings, etc.)
  - **`hooks/`** - Custom React hooks (useAuth, useDebounce, etc.)
  - **`lib/`** - Utility libraries (auth, posts, hashtags, etc.)
  - **`types/`** - TypeScript type definitions
  - **`utils/`** - Helper utilities (clipboard, export, markdown)
- **`public/`** - Static assets (favicon, etc.)
- **`index.html`** - Main HTML entry point

### 📁 `attached_assets/` - Media Files
User-uploaded images and content files:
- Screenshots, images, and text files uploaded by users
- Used for post content and media attachments

### 📁 Configuration Files
- **`package.json`** - Dependencies and scripts
- **`vite.config.ts`** - Vite build configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration
- **`components.json`** - shadcn/ui component configuration
- **`firestore.rules`** - Firebase Firestore security rules

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Firebase project set up

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable Authentication and set up Email/Password and Google sign-in methods
3. Create a Firestore database in production mode
4. Copy your Firebase config values (API Key, Project ID, App ID, etc.)
5. Apply the Firestore security rules from `firestore.rules`

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Installation & Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
