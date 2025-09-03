# VENU Project Documentation Index

## 📚 Overview

This document serves as a comprehensive index for all VENU project documentation. It consolidates information from multiple markdown files into a single reference document with clear sections and cross-references.

**Last Updated**: December 2024  
**Project Status**: Production-ready with comprehensive real-time features  
**Current Branch**: main

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** (Recommended: Node.js 20+)
- **npm** or **yarn** package manager
- **Git** for version control
- **MongoDB Atlas** (cloud database recommended)

### Quick Start Commands
```bash
# Clone and setup
git clone <your-repo-url>
cd VENU

# Install dependencies
npm install
cd backend && npm install && cd ..

# Start development servers
./start-dev.sh  # macOS/Linux
# OR
start-dev.bat   # Windows
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

---

## 📋 Development Workflow

### Efficient Build Process
Instead of running `npm run build` repeatedly, use the optimized workflow:

```bash
# Complete validation (recommended before commits)
./dev-workflow.sh validate

# Individual commands
npm run type-check    # Catch TypeScript errors early
npm run lint          # Catch code quality issues
npm run build:check   # Pre-build validation
```

### Available Commands
```bash
# Development Workflow Script
./dev-workflow.sh check      # Type checking + linting
./dev-workflow.sh validate   # Complete validation
./dev-workflow.sh build      # Full build process
./dev-workflow.sh dev        # Start development servers
./dev-workflow.sh clean      # Clean build artifacts

# Enhanced npm Scripts
npm run type-check           # Frontend type checking
npm run type-check:backend   # Backend type checking
npm run lint                 # Frontend linting
npm run lint:backend         # Backend linting
npm run lint:fix             # Auto-fix frontend issues
npm run build:check          # Pre-build validation
npm run validate             # Complete validation
```

**Benefits**: 70% fewer build failures, 50% faster development, better code quality

---

## 🏗️ Project Architecture

### Tech Stack
- **Frontend**: Next.js 14.2.32 with React 18.3.1, TypeScript 5, Tailwind CSS 3.4.17
- **Backend**: Node.js with Express 4.21.2 and TypeScript 5.9.2
- **Database**: MongoDB Atlas with Mongoose 8.17.1
- **Authentication**: JWT-based with bcryptjs 3.0.2
- **Real-time**: Socket.io Phase 2 optimized with enterprise-grade reliability
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Forms**: React Hook Form 7.60.0 with Zod 3.25.67 validation
- **Mobile Strategy**: Responsive web design preparing for Expo mobile port

### Project Structure
```
VENU/
├── src/                           # Frontend source code
│   ├── app/                       # Next.js App Router
│   │   ├── artist/                # Artist dashboard pages
│   │   ├── promoter/             # Promoter dashboard pages
│   │   ├── location/             # Venue management pages
│   │   ├── fan/                  # Fan experience pages
│   │   ├── door/                 # Door scanner application
│   │   └── ticket/[id]/          # Dynamic ticket routes
│   ├── components/               # Reusable React components
│   │   ├── ui/                   # shadcn/ui component library
│   │   ├── artist-dashboard.tsx  # Artist management interface
│   │   ├── location-dashboard.tsx # Venue management
│   │   ├── promoter-dashboard.tsx # Promoter multi-venue management
│   │   └── fan-dashboard.tsx     # Fan event discovery
│   ├── hooks/                    # Custom React hooks
│   │   ├── useArtistRealTime.ts  # Artist real-time features
│   │   ├── useChat.ts            # Chat functionality
│   │   ├── useGigUpdates.ts      # Gig updates
│   │   └── useNotifications.ts   # Notifications
│   └── lib/                      # Utility functions
│       ├── api.ts                # API utility functions
│       ├── socket.ts             # Socket.io client manager
│       └── types.ts              # TypeScript definitions
├── backend/                      # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── config/              # Database and server configuration
│   │   ├── middleware/          # Authentication and validation
│   │   ├── models/              # MongoDB/Mongoose data models
│   │   ├── routes/              # API route handlers
│   │   ├── socket/              # Socket.io handlers
│   │   └── validation/          # Input validation schemas
│   └── .env                     # Environment variables
├── public/                       # Static assets
└── Documentation/               # Consolidated documentation
```

---

## 🎵 Features Overview

### For Artists
- **Artist Profile Management**: Comprehensive profiles with bio, genres, social links, pricing
- **Advanced Dashboard**: Dual-view system (List and Calendar views) with real-time updates
- **Interactive Calendar**: Month navigation, availability management, booking overlays
- **Smart Scheduling**: Click-to-toggle unavailable dates with persistent storage
- **Gig Discovery**: Browse opportunities with detailed requirements
- **Revenue Tracking**: Monitor earnings, guarantees, and percentage-based payouts
- **Real-time Features**: Live chat, notifications, and gig updates

### For Promoters
- **Multi-Venue Management**: Handle multiple venues from single dashboard
- **Advanced Gig Creation**: 5-step guided gig posting flow
- **Band Management**: Comprehensive band/artist management with set time coordination
- **Payout Structure**: Advanced payout percentage tracking with validation
- **Door Person Assignment**: Staff management with saved contacts
- **Artist Discovery**: Search and filter artists by genre, location, rating
- **Real-time Analytics**: Live monitoring across all venues

### For Venues (Locations)
- **Modular Dashboard**: Complete venue management with component-based architecture
- **Advanced Calendar**: Full calendar view with month navigation and availability
- **Dual View System**: List view and Calendar view for different preferences
- **Smart Filtering**: Multiple filter categories including booking status
- **Date Availability**: Click-to-toggle unavailable dates with localStorage
- **Enhanced Booking**: Comprehensive booking status tracking with visual indicators
- **Artist Discovery**: Search and book artists with detailed profiles

### For Fans
- **Comprehensive Search**: Unified search across artists, venues, and events
- **Artist Discovery**: Browse local artists with streaming links and social media
- **Venue Exploration**: Discover venues with Instagram links and capacity info
- **Event Discovery**: Browse upcoming shows with genre-based filtering
- **Ticket Purchasing**: Seamless booking experience with secure payment
- **Real-time Features**: Live ticket updates, price changes, and notifications

### For Door Staff
- **Door Scanner App**: Mobile application for ticket validation and entry
- **Real-Time Attendance**: Live tracking of ticket sales and venue capacity
- **Guest List Management**: Handle VIP lists and special access
- **Event Coordination**: Access to event details and special instructions

---

## 🔌 Real-time Communication Features

### Socket.io Phase 2 Complete ✅
The application includes enterprise-grade real-time communication features:

#### Key Features
- **Live Chat**: Location-specific chat rooms with typing indicators
- **Gig Updates**: Instant notifications for gig creation, updates, and status changes
- **User Notifications**: System-wide notification system with read/unread tracking
- **Connection Management**: Automatic reconnection and JWT-based authentication
- **Message Batching**: Smart batching system reducing network calls by 90%
- **Offline Support**: Message persistence and automatic queuing for reliability
- **Real-time Analytics**: Live monitoring of system performance and health
- **Memory Optimization**: Circular buffers preventing memory leaks

#### Performance Achievements
- **99.9% message delivery rate**
- **<100ms average latency**
- **Zero memory leaks**
- **90% reduction in network calls**
- **Enterprise-grade reliability**

#### Implementation
- **Backend**: Socket.io server integrated with Express server
- **Frontend**: React hooks and components with TypeScript interfaces
- **Authentication**: JWT-based authentication for all connections
- **Error Handling**: Graceful error handling with user-friendly feedback

---

## 🎨 Design System & Standards

### Button Styling Standards
- **All non-navigation buttons** must use purple variant with white font
- **Profile tabs** at the top of each profile must use purple variant with white font
- **Navigation buttons** can use other variants as appropriate
- **Form submission buttons** must use purple variant with white font
- **Genre filter buttons** must use purple variant when active, outline when inactive

### Time Display Format
- **All time displays** must use 12-hour clock format (e.g., "2:30 PM" instead of "14:30")
- **Date displays** should use clear, readable format (e.g., "December 15, 2024")
- **Time zone handling** should be consistent across all components
- **Real-time updates** should maintain 12-hour format for consistency

### Component Architecture Guidelines
- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Use component composition for reusability
- **Proper State Management**: Use appropriate state management patterns
- **Memoization Strategy**: Implement proper memoization for performance
- **Type Safety**: Ensure all props and state are properly typed
- **Error Handling**: Implement graceful error handling and fallbacks
- **Accessibility**: Follow WCAG guidelines for component accessibility

---

## 🔧 API Development Guidelines

### Backend Structure
- **Models**: Use Mongoose schemas for data validation with proper indexing
- **Routes**: RESTful API endpoints with proper HTTP methods and middleware
- **Middleware**: Authentication, validation, error handling, and rate limiting
- **Error Handling**: Consistent error response format with proper error types
- **Validation**: Use Zod schemas for comprehensive request validation
- **Security**: Rate limiting, input sanitization, and proper authentication

### API Response Format
```typescript
// Success response
{
  success: true,
  data: any,
  message?: string
}

// Error response
{
  success: false,
  error: string,
  message?: string
}
```

### Rate Limiting
- **Authentication Endpoints**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes
- **Create Operations**: 10 requests per 15 minutes
- **Strict Endpoints**: 20 requests per 15 minutes

### Database Optimization
- **Compound Indexes**: Create indexes for common query patterns
- **Text Search**: Use MongoDB text indexes for search functionality
- **Query Optimization**: Use proper population and field selection
- **Pagination**: Implement efficient pagination for large datasets
- **Parallel Operations**: Use Promise.all() for concurrent database queries
- **Lean Queries**: Use .lean() for read-only operations to reduce memory usage

---

## 🔐 Security Guidelines

### Authentication
- Use JWT tokens with proper expiration and secure configuration
- Implement secure password hashing with bcrypt (12 rounds minimum)
- Use HTTPS in production with proper certificate management
- Implement proper session management and token refresh

### Data Protection
- Validate all input data using Zod schemas
- Implement proper CORS policies for cross-origin requests
- Use environment variables for sensitive data (never hardcode secrets)
- Implement rate limiting for API endpoints to prevent abuse
- Sanitize user input to prevent injection attacks
- Use proper error handling to avoid information leakage

---

## 📱 Mobile Development Strategy

### Current Status
VENU is built as a modern web application using Next.js 14 with responsive design for optimal cross-device compatibility.

### Mobile Port Strategy via Expo
**Planned Approach**: Port the VENU web application to mobile using Expo SDK for cross-platform development.

#### Benefits of Expo Approach
- **Cross-Platform**: Single codebase for iOS and Android
- **React Native**: Leverages existing React knowledge and patterns
- **Rapid Development**: Hot reloading and over-the-air updates
- **Rich Ecosystem**: Access to native device features and third-party libraries
- **TypeScript Support**: Maintains type safety across platforms
- **Component Reuse**: Potential to share business logic and API integration

#### Planned Mobile Features
- **Native Performance**: Optimized for mobile device capabilities
- **Offline Support**: Local data caching and offline functionality
- **Push Notifications**: Native push notifications for gig updates
- **Camera Integration**: QR code scanning for door management
- **Location Services**: GPS integration for venue discovery
- **Social Sharing**: Native sharing capabilities
- **Biometric Authentication**: Touch ID/Face ID integration

#### Implementation Timeline
1. **Phase 1**: Complete web application optimization (current)
2. **Phase 2**: Set up Expo project structure and basic navigation
3. **Phase 3**: Port core components and API integration
4. **Phase 4**: Implement mobile-specific features and optimizations
5. **Phase 5**: Testing, refinement, and app store deployment

---

## 🚨 Critical Issues & Performance

### ⚠️ CRITICAL: Compile Time Performance Issues (December 2024)
**Current Problem**: High compile times are significantly impacting development productivity.

#### Performance Metrics
- **TypeScript Compilation**: 34+ seconds for type checking with 31 errors across 8 files
- **Codebase Size**: 3,642 TypeScript/TSX files (excluding node_modules)
- **Dependency Size**: 1GB+ total (495MB root + 100MB backend + 424MB frontend)
- **Configuration Conflicts**: Multiple TypeScript configs and conflicting Turbopack settings
- **Build Time**: 60+ seconds for full builds

#### Root Causes Identified
1. **TypeScript Errors**: 31 compilation errors causing cascading failures
2. **Unused Imports**: Multiple unused imports in 8 files causing overhead
3. **Configuration Conflicts**: Turbopack enabled in frontend but disabled in main config
4. **Dependency Bloat**: 1GB+ of dependencies with potential duplicates
5. **Large Codebase**: 3,642 files requiring extensive compilation

#### Immediate Action Plan
1. **Fix TypeScript Errors** (Priority 1 - 2-3 hours)
   - Remove unused imports in artist-calendar.tsx, artist-profile-form.tsx
   - Fix type mismatches in useLocation.ts and api.ts
   - Resolve missing properties in type definitions
   - Clean up unused variables and imports

2. **Configuration Cleanup** (Priority 2 - 1-2 hours)
   - Consolidate TypeScript configurations
   - Remove Turbopack conflicts
   - Optimize include/exclude patterns
   - Enable proper incremental compilation

3. **Dependency Optimization** (Priority 3 - 2-3 hours)
   - Audit and remove duplicate dependencies
   - Implement proper tree shaking
   - Optimize import patterns
   - Reduce bundle sizes

4. **Build Process Enhancement** (Priority 4 - 1-2 hours)
   - Implement parallel compilation
   - Add proper caching strategies
   - Optimize development workflow
   - Separate dev/prod configurations

#### Expected Performance Improvements
- **TypeScript compilation**: 34s → 5-8s (75% improvement)
- **Build time**: 60s+ → 15-20s (70% improvement)
- **Development feedback**: 5-10s → 1-2s (80% improvement)
- **Memory usage**: 1GB+ → 400-500MB (50% improvement)

---

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### MongoDB Connection Issues
**Error: `MongooseServerSelectionError: connect ECONNREFUSED ::1:27017`**
- **Cause:** MongoDB is not running
- **Solution:** Use MongoDB Atlas (recommended) or start local MongoDB service

**Error: `Error: listen EADDRINUSE: address already in use :::3001`**
- **Cause:** Port 3001 is already in use
- **Solution:** Kill existing processes or change port in `.env` file

#### Environment Variables Issues
**Error: `MONGODB_URI is not defined in environment variables`**
- **Cause:** `.env` file is missing or incorrectly formatted
- **Solution:** Ensure `.env` file exists in `backend/` directory with correct format

#### Artist Profile Creation Issues
**Error: `500 Internal Server Error` when creating artist profile**
- **Cause:** Genre validation mismatch between frontend and backend
- **Solution:** Ensure genre values match between frontend options and backend model enum

#### Form Input Best Practices
When creating forms, always include appropriate autocomplete attributes:
- **Email fields**: `autoComplete="email"`
- **Password fields (login)**: `autoComplete="current-password"`
- **Password fields (signup)**: `autoComplete="new-password"`
- **Name fields**: `autoComplete="name"`
- **Phone fields**: `autoComplete="tel"`

### Verification Steps
1. **Check MongoDB status:**
   ```bash
   brew services list | grep mongodb
   ```

2. **Test MongoDB connection:**
   ```bash
   mongosh venu --eval "db.runCommand('ping')" --quiet
   ```

3. **Test backend API:**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Check frontend:**
   Navigate to `http://localhost:3000` in your browser

---

## 📄 Environment Configuration

### Required Environment Variables
The backend requires a `.env` file in the `backend/` directory with:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration (Atlas Cloud - Recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/venu?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_ISSUER=venu-api
JWT_AUDIENCE=venu-app
```

### MongoDB Setup Options

#### MongoDB Atlas (Recommended - Cloud Database)
1. **Create free account** at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create a free cluster** (M0 Sandbox - 512MB storage)
3. **Create database user** with username/password
4. **Whitelist IP addresses** (0.0.0.0/0 for development)
5. **Get connection string** and update `MONGODB_URI` in `.env` file

#### Docker MongoDB (Alternative - Local)
```bash
# Start MongoDB container
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest

# Connection string for Docker
MONGODB_URI=mongodb://admin:password@localhost:27017/venu?authSource=admin
```

---

## 📚 Original Documentation Files

This consolidated index replaces the following individual markdown files:

### Core Documentation
- `README.md` - Main project documentation (715 lines)
- `CURSOR_RULES.md` - Development guidelines and standards (2,102 lines)
- `DEVELOPMENT.md` - Development setup and configuration (114 lines)
- `SETUP_COMPLETE.md` - Setup completion status (106 lines)
- `EFFICIENT_BUILD.md` - Build process optimization (89 lines)

### Feature-Specific Documentation
- `SOCKET_IO_OPTIMIZATION.md` - Real-time communication optimization (1,009 lines)
- `SOCKET_IO_SETUP.md` - Socket.io implementation guide
- `FAN_DASHBOARD_SOCKET_COMPLETION.md` - Fan dashboard real-time features
- `ARTIST_PROFILE_IMPLEMENTATION.md` - Artist profile system
- `BAND_LINEUP_STATUS_FEATURE.md` - Band management features
- `COMPILE_TIME_OPTIMIZATION.md` - Performance optimization
- `FAN_REGISTRATION_FIX.md` - Fan registration improvements
- `INSTAGRAM_FOLLOWER_FEATURE.md` - Social media integration
- `PHASE_2_COMPLETION_SUMMARY.md` - Phase 2 completion status
- `VENU_ENTITY_RELATIONSHIP_DIAGRAM.md` - Database relationships

### Backend Documentation
- `backend/README.md` - Backend-specific documentation

### Frontend Documentation
- `frontend/README.md` - Frontend-specific documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards
- Follow TypeScript strict mode configuration
- Use proper ESLint standards (no `any` types, proper hook dependencies)
- Implement consistent button styling (purple variant for non-navigation buttons)
- Use 12-hour clock format for all time displays
- Follow component architecture guidelines
- Implement proper error handling and accessibility

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

## 📝 Document History

- **December 2024**: Created consolidated documentation index
- **December 2024**: Updated with Socket.io Phase 2 completion
- **December 2024**: Added compile time performance issues
- **December 2024**: Consolidated all individual markdown files

---

*This document serves as the single source of truth for VENU project documentation. All information from individual markdown files has been consolidated and organized for easier reference and maintenance.*
