# ReWear - Community Clothing Exchange

## Overview

ReWear is a full-stack sustainable fashion platform that enables users to exchange unused clothing through direct swaps or a point-based system. The application is built with a modern tech stack featuring React/TypeScript frontend, Express.js backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens and gradient themes
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer for image handling
- **Authentication**: Session-based auth with bcrypt password hashing
- **API Design**: RESTful endpoints with structured error handling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless with WebSocket support

## Key Components

### Authentication System
- Email/password registration and login
- Role-based access control (user/admin)
- Session-based authentication with secure cookies
- Password hashing with bcrypt
- Protected routes with middleware

### Item Management
- CRUD operations for clothing items
- Image upload and storage
- Category-based organization (men/women/kids)
- Size and condition tracking
- Admin approval workflow
- Search and filtering capabilities
- **AI-powered auto-generation of tags and descriptions from images**

### Swap System
- Direct item swaps between users
- Point-based redemption system
- Swap request management
- Status tracking (pending/approved/completed)
- Point transaction history

### User Dashboard
- Personal profile management
- Item listing management
- Swap history tracking
- Point balance display
- Upload status monitoring

### Admin Panel
- Item approval/rejection
- User management
- System statistics
- Content moderation

### AI Features (Google Gemini API)
- **Auto-Generate Tags and Descriptions**: Analyzes uploaded images and titles to suggest item descriptions, tags, and condition ratings
- **Natural Language Search**: Converts user queries like "looking for casual summer dresses in size M" into structured search filters
- **Content Moderation**: AI-powered filtering of inappropriate content in descriptions
- **Smart Suggestions**: Intelligent recommendations based on image analysis and user input

## Data Flow

1. **User Registration/Login**: Client submits credentials → Server validates → Session created → User data cached
2. **Item Upload**: User submits item data + images → Server validates → Files stored → Database updated → Admin notification
3. **Browse Items**: Client requests items → Server applies filters → Database query → Results returned with owner info
4. **Swap Request**: User initiates swap → Server validates eligibility → Database transaction → Notifications sent
5. **Admin Actions**: Admin reviews items → Status updated → Database modified → User notifications

## External Dependencies

### UI/UX Libraries
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Lucide React for icons
- Class Variance Authority for component variants

### Backend Dependencies
- Express.js for server framework
- Multer for file uploads
- bcryptjs for password hashing
- express-session for session management
- connect-pg-simple for PostgreSQL session store

### Database & ORM
- Drizzle ORM for type-safe database operations
- Neon serverless PostgreSQL
- Drizzle Kit for schema management

### Development Tools
- Vite for build tooling
- ESBuild for server bundling
- TypeScript for type safety
- Replit integration for development environment

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for TypeScript execution in development
- Concurrent frontend and backend development

### Production Build
- Vite build for optimized frontend bundle
- ESBuild for server-side bundling
- Static file serving from Express
- Environment-based configuration

### Database
- Drizzle migrations for schema updates
- Neon serverless for production database
- Connection pooling for performance

### File Storage
- Local file system for uploads (development)
- Configurable for cloud storage integration

The architecture emphasizes type safety, developer experience, and scalability while maintaining a clean separation between frontend and backend concerns. The point-based system encourages user engagement while the admin approval workflow ensures content quality.