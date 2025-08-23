# Draftwell - LinkedIn Post Manager

## Overview

Draftwell is a full-stack LinkedIn post management application built with React, TypeScript, and Firebase. The application allows users to create, edit, organize, and schedule LinkedIn posts with AI-powered rating system, markdown editing, character counting, and real-time synchronization. The app provides a complete content creation workflow from draft to publication with advanced filtering, search capabilities, and intelligent content analysis.

**Current Version:** v2.0.0 - AI Rating System

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **Form Handling**: React Hook Form with Zod validation for robust form management

### Authentication & Data Layer
- **Authentication**: Firebase Auth supporting email/password and Google OAuth sign-in
- **Database**: Firestore with hierarchical data structure (`users/{uid}/posts/{postId}`)
- **Real-time Updates**: Firestore subscriptions for live data synchronization across sessions
- **Data Validation**: Zod schemas for type-safe data validation on both client and server

### Content Management Features
- **Rich Text Editor**: Markdown-based editor with live preview using marked.js
- **Character Counting**: LinkedIn-specific 3000 character limit with soft warnings at 2600 characters
- **Auto-save**: Debounced auto-save with 800ms delay and optimistic UI updates
- **Post Actions**: Copy to clipboard, duplicate posts, and export as text files
- **AI Rating System**: Get posts rated 1-10 with personalized improvement suggestions via Firebase cloud functions
- **AI Rated Tracking**: Automatic flag management based on rating data with visual badges
- **Character Validation**: 100-1000 character requirement for AI rating with user-friendly validation
- **Status Tracking**: Simple draft/published status system for tracking post lifecycle
- **Filtering & Search**: Real-time filtering by status (draft/published) and text search
- **Rating Display**: Post scores visible in both editor and post list views

### Backend Infrastructure
- **Express Server**: Node.js server with Express for API routing (currently minimal, primarily using Firebase)
- **Database ORM**: Drizzle ORM configured for PostgreSQL (appears to be set up but not actively used in favor of Firestore)
- **Session Management**: PostgreSQL session storage with connect-pg-simple

### Development & Build
- **TypeScript Configuration**: Strict mode enabled with path mapping for clean imports
- **Development Server**: Vite dev server with HMR and runtime error overlay
- **Production Build**: Optimized bundling with ESBuild for server-side code
- **Environment Configuration**: Environment variables for Firebase configuration

### Security & Access Control
- **Route Protection**: AuthGuard component protecting all authenticated routes
- **Firestore Security**: Security rules enforcing user-based data access (referenced in README)
- **Input Sanitization**: Zod validation preventing malicious input

### UI/UX Design Patterns
- **Component Architecture**: Modular component design with reusable UI components
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Loading States**: Skeleton loaders and optimistic UI updates for smooth user experience
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Toast Notifications**: Real-time feedback for user actions

## External Dependencies

### Core Firebase Services
- **Firebase Authentication**: User authentication with email/password and Google OAuth
- **Firestore Database**: NoSQL document database for real-time data storage and synchronization
- **Firebase SDK**: Client-side SDK for seamless integration with Firebase services

### UI & Styling Libraries
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TanStack Query**: Data fetching and caching library for server state management
- **React Hook Form**: Form library for performance and developer experience
- **Zod**: Schema validation library for type-safe data validation
- **marked.js**: Markdown parser and compiler for rich text functionality
- **date-fns**: Date utility library for formatting and manipulation

### Database & ORM (Configured but Unused)
- **Neon Database**: Serverless PostgreSQL database (configured via Drizzle)
- **Drizzle ORM**: Type-safe SQL ORM for PostgreSQL operations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Build & Development
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript/TypeScript bundler for production builds
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing

The application follows a modern JAMstack architecture with Firebase as the primary backend service, providing real-time capabilities and seamless authentication. The frontend is built with performance and user experience in mind, utilizing optimistic updates and efficient state management patterns.