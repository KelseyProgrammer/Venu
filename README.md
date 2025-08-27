# VENU - Live Music Venue Booking Platform

A comprehensive platform for managing live music events, connecting artists, promoters, venues, and fans. Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui with mobile support via Capacitor.

## 🎵 What is VENU?

VENU is "The Transparent Booking Platform for Live Music" that streamlines the entire process of organizing and attending live music events. From initial booking to door management, VENU provides tools for every stakeholder in the live music ecosystem with a focus on transparency, efficiency, and user experience.

## ✨ Features

### For Artists
- **Artist Dashboard**: Comprehensive gig management and performance tracking
- **Gig Discovery**: Browse available opportunities with detailed requirements
- **Set Time Management**: Schedule performances with automatic time slot coordination
- **Revenue Tracking**: Monitor earnings, guarantees, and percentage-based payouts
- **Application System**: Apply to gigs with portfolio and requirements matching
- **Performance Analytics**: Track attendance, ratings, and repeat booking rates

### For Promoters
- **Multi-Venue Management**: Handle multiple venues from a single dashboard
- **Gig Posting System**: Create detailed events with band requirements and payout structures
- **Artist Coordination**: Manage applications, confirmations, and communication
- **Revenue Management**: Set guarantees, bonus tiers, and percentage distributions
- **Cross-Venue Analytics**: Consolidated performance metrics across all venues
- **Event Promotion**: Built-in tools for marketing and ticket sales tracking

### For Venues (Locations)
- **Location Dashboard**: Complete venue management with comprehensive calendar system
- **Calendar Views**: List view for event management and visual calendar view for scheduling
- **Availability Management**: Click-to-toggle date availability with persistent storage
- **Event Scheduling**: Visual calendar with availability tracking and conflict detection
- **Smart Filtering**: Separate filters for List view (event-focused) and Calendar view (includes date availability)
- **Band Management**: Track expected vs. confirmed bands with visual progress indicators
- **Capacity Management**: Real-time ticket sales and occupancy monitoring
- **Staff Coordination**: Door person assignment and communication tools
- **Equipment Tracking**: Manage technical requirements and availability
- **Performance Analytics**: Detailed insights into venue performance and profitability
- **Promoter Management**: Maintain relationships with multiple promoters and their payout structures

### For Fans
- **Event Discovery**: Browse upcoming shows with filtering by genre, date, and location
- **Ticket Purchasing**: Seamless booking experience with secure payment processing
- **Event Information**: Detailed show information including lineup, times, and venue details
- **Favorites System**: Save preferred artists and venues for personalized recommendations
- **Ticket Management**: Digital ticket storage and easy access for events

### For Door Staff
- **Door Scanner App**: Mobile application for ticket validation and entry management
- **Real-Time Attendance**: Live tracking of ticket sales and venue capacity
- **Guest List Management**: Handle VIP lists and special access requirements
- **Event Coordination**: Access to event details, timing, and special instructions

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (Recommended: Node.js 20+)
- **npm** or **yarn** package manager
- **Git** for version control
- **Android Studio** (for Android mobile development)
- **Xcode** (for iOS mobile development, macOS only)

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd VENU
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Mobile Development Setup

For mobile app development with Capacitor:

1. **Install Capacitor CLI:**
```bash
npm install -g @capacitor/cli
```

2. **Build the web app:**
```bash
npm run build
```

3. **Add mobile platforms:**
```bash
npx cap add android
npx cap add ios
```

4. **Sync and run:**
```bash
npx cap sync
npx cap run android  # For Android
npx cap run ios      # For iOS
```

## 📱 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Mobile Development
- `npx cap sync` - Sync web assets to mobile platforms
- `npx cap run android` - Run on Android device/emulator
- `npx cap run ios` - Run on iOS device/simulator
- `npx cap build android` - Build Android APK
- `npx cap build ios` - Build iOS app

## 🏗️ Project Structure

```
VENU/
├── src/                           # Source code
│   ├── app/                       # Next.js App Router
│   │   ├── artist/               # Artist dashboard pages
│   │   ├── promoter/             # Promoter dashboard pages
│   │   ├── location/             # Venue management pages
│   │   ├── fan/                  # Fan experience pages
│   │   ├── door/                 # Door scanner application
│   │   ├── ticket/[id]/          # Dynamic ticket pages
│   │   ├── get-started/          # Onboarding flow
│   │   ├── learn-more/           # Information pages
│   │   ├── globals.css           # Global styles and CSS variables
│   │   ├── layout.tsx            # Root layout with providers
│   │   └── page.tsx              # Home page with splash screen
│   ├── components/               # Reusable React components
│   │   ├── ui/                   # shadcn/ui component library
│   │   │   ├── button.tsx        # Custom button component
│   │   │   ├── card.tsx          # Card layout component
│   │   │   ├── input.tsx         # Form input component
│   │   │   ├── tabs.tsx          # Tab navigation component
│   │   │   └── ...               # Other UI components
│   │   ├── artist-dashboard.tsx  # Artist management interface
│   │   ├── promoter-dashboard.tsx # Promoter multi-venue management
│   │   ├── location-dashboard.tsx # Venue management with gig posting
│   │   ├── fan-dashboard.tsx     # Fan event discovery and tickets
│   │   ├── door-scanner.tsx      # Mobile door management app
│   │   ├── ticket-purchase.tsx   # Ticket buying interface
│   │   ├── onboarding-flow.tsx   # User registration and setup
│   │   ├── auth-flow.tsx         # Authentication and role selection
│   │   ├── splash-screen.tsx     # App loading and introduction
│   │   └── gig-details.tsx       # Detailed event information
│   └── lib/                      # Utility functions and shared data
│       ├── types.ts              # TypeScript type definitions
│       ├── location-data.ts      # Standardized venue information
│       ├── constants.ts          # Shared form options and helper functions
│       └── utils.ts              # Helper functions and utilities
├── frontend/                     # Mobile app configuration
│   ├── android/                  # Android-specific files
│   ├── ios/                      # iOS-specific files
│   └── capacitor.config.ts       # Capacitor configuration
├── backend/                      # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   ├── shared/              # Shared backend types
│   │   └── server.ts            # Express server setup
│   └── package.json             # Backend dependencies
├── public/                       # Static assets
│   └── images/                  # Image assets (logos, venue photos)
├── components.json               # shadcn/ui configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Main project dependencies
```

## 🎨 Design System

### Visual Identity
- **Primary Color**: Purple (#9333ea) with white text for all non-navigation buttons
- **Typography**: Geist font family with serif headings and sans-serif body text
- **Components**: Built with shadcn/ui for consistency and accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Theme**: Dark mode support with next-themes integration

### Component Standards
- **Buttons**: Purple variant with white font for all action buttons
- **Navigation**: Tabs use purple variant with white font for active states
- **Cards**: Consistent border radius, shadows, and spacing
- **Forms**: Unified input styling with proper focus states
- **Images**: Standardized fallback system with proper aspect ratios

### Responsive Design
- **Mobile-First**: Optimized for mobile devices with progressive enhancement
- **Breakpoints**: Tailwind's responsive breakpoints (sm, md, lg, xl, 2xl)
- **Touch-Friendly**: Appropriate touch targets and spacing for mobile interaction

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14.2.32 with App Router
- **Language**: TypeScript 5+ with strict mode
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks (useState, useEffect, useMemo, useCallback)
- **Date Handling**: date-fns for date manipulation
- **Charts**: Recharts for data visualization

### Mobile Development
- **Framework**: Capacitor for cross-platform mobile apps
- **Platforms**: Android and iOS support
- **Build Tools**: Android Studio and Xcode integration
- **Native Features**: Camera, file system, and device APIs

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript for type safety
- **API**: RESTful API design with proper error handling
- **Database**: (To be implemented) PostgreSQL or MongoDB
- **Authentication**: (To be implemented) JWT-based authentication

### Development Tools
- **Package Manager**: npm with lock file for dependency management
- **Linting**: ESLint for code quality
- **Type Checking**: TypeScript compiler with strict configuration
- **Build Tool**: Next.js built-in bundler with optimization
- **Version Control**: Git with conventional commit messages

## 🔧 Adding shadcn/ui Components

To add new shadcn/ui components:

1. **Use the shadcn CLI:**
```bash
npx shadcn@latest add [component-name]
```

2. **Or manually create components** following the shadcn/ui patterns in the `src/components/ui/` directory.

3. **Import and use** the component in your React components:
```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

## 🔧 Shared Constants System

### Centralized Form Options
VENU uses a centralized constants system in `src/lib/constants.ts` to ensure consistency across all dashboards:

```typescript
// Time options for all time pickers
export const TIME_OPTIONS = [
  { value: "19:00", label: "7:00 PM - Doors Open" },
  { value: "19:30", label: "7:30 PM - First Act" },
  { value: "20:00", label: "8:00 PM" },
  // ... more options
]

// Genre options for all genre selectors
export const GENRE_OPTIONS = [
  { value: "jazz", label: "Jazz" },
  { value: "rock", label: "Rock" },
  { value: "electronic", label: "Electronic" },
  // ... more options
]

// Helper function for consistent time display
export const getTimeLabel = (timeValue: string): string => {
  return TIME_OPTIONS.find(option => option.value === timeValue)?.label || timeValue
}
```

### Benefits
- **Consistency**: Same options and labels across all dashboards
- **Maintainability**: Update options in one place
- **Performance**: Memoized constants prevent recreation
- **Type Safety**: Centralized type definitions
- **Code Quality**: Eliminates duplication and hardcoded values

## 📊 Core Business Logic

The platform manages comprehensive event lifecycle data:

### Event Management
- **Gigs**: Complete event information including bands, requirements, and logistics
- **Bands**: Artist information, set times, and revenue sharing percentages
- **Requirements**: Equipment and technical needs with dynamic checklist system
- **Tickets**: Capacity management, sales tracking, and real-time availability
- **Locations**: Venue details, availability, and capacity management

## 📅 Calendar System

### Venue Calendar Management
The location dashboard features a comprehensive calendar system for venue management:

#### **Dual View System**
- **List View**: Traditional event list with event-focused filtering (All Events, Complete, Needs Bands)
- **Calendar View**: Visual calendar grid with month navigation and day-by-day event display

#### **Availability Management**
- **Click-to-Toggle**: Days without shows can be clicked to toggle availability (available ↔ unavailable)
- **Persistent Storage**: All availability changes are automatically saved to localStorage
- **Visual Feedback**: Clear visual indicators for available, unavailable, and event days

#### **Smart Filtering**
- **List View Filters**: Event-focused filters for managing bookings and applications
- **Calendar View Filters**: Includes date availability filters (All Dates, Available, Unavailable) in addition to event filters
- **Filter Logic**: 
  - **All Dates Filter**: Shows both available and unavailable dates with clear visual distinction
  - **Available Filter**: Shows only free dates (no events, not unavailable, not past)
  - **Unavailable Filter**: Shows only blocked dates with enhanced styling
  - **Event Filters**: Filter by completion status and band requirements

#### **Visual States**
- **Today**: Purple square background with white text (matches "Today" button styling)
- **Available**: White background with gray border, "Available" text in black
- **Unavailable**: White background with red border, "Unavailable" text in red
- **Events (Complete)**: White background with green border
- **Events (Needs Bands)**: White background with yellow border, shows "Need X more" bands
- **Past Dates**: Muted styling, non-interactive

#### **Enhanced Features**
- **Bands Progress**: Yellow event days display exact number of bands still needed
- **Legend System**: Solid colored squares showing all calendar day states
- **Month Navigation**: Previous/Next month buttons with "Today" quick navigation
- **Today Integration**: Current day uses purple square background with white text to match "Today" button
- **All Dates Filter**: Comprehensive filter showing both available and unavailable dates
- **Enhanced Visibility**: Improved day number visibility with better contrast and positioning
- **Responsive Design**: Calendar adapts to different screen sizes with proper touch targets
- **Real-time Updates**: Changes are immediately reflected across all views

### Financial Management
- **Guarantees**: Minimum payment structures for artists
- **Revenue Sharing**: Percentage-based payout systems
- **Bonus Tiers**: Performance-based incentive structures
- **Promoter Fees**: Configurable percentage allocations

### User Management
- **Multi-Role Support**: Artists, promoters, venues, fans, and door staff
- **Role-Based Dashboards**: Specialized interfaces for each user type
- **Cross-Venue Management**: Promoters can manage multiple venues
- **Staff Coordination**: Door person assignment and communication

## ⚡ Performance Optimizations ✅ IMPLEMENTED

### React Performance
- **useMemo**: Expensive calculations are memoized (band totals, validation logic)
- **useCallback**: Event handlers are memoized to prevent unnecessary re-renders
- **Functional State Updates**: Array operations use functional updates to prevent stale closures
- **Memoized Mock Data**: Static data arrays are memoized to prevent recreation
- **Optimized Dependencies**: Proper dependency arrays prevent unnecessary re-renders

### Code Quality
- **Eliminated Duplication**: Shared constants for repeated options (TIME_OPTIONS, GENRE_OPTIONS) in `src/lib/constants.ts`
- **Simplified Logic**: Complex conditionals replaced with helper functions like `getTimeLabel()`
- **Consistent Patterns**: Uniform approach applied across all similar functionality
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Centralized Configuration**: All form options and step configurations in one place
- **Clean Code**: No console statements or debug code in production

### Bundle Optimization
- **Next.js Optimization**: Built-in code splitting and image optimization
- **Tree Shaking**: Unused code elimination through ES modules
- **Lazy Loading**: Components loaded on demand for better initial load times
- **Image Optimization**: Next.js Image component with proper fallbacks

### Recent Performance Improvements
- **All Dashboards**: Fully optimized with React best practices
- **Form Validation**: Memoized validation logic for faster user interactions
- **State Management**: Optimized with proper dependency arrays and functional updates
- **Code Reuse**: Extracted shared constants and helper functions for maintainability
- **Constants System**: Centralized form options in `src/lib/constants.ts` for consistency and performance
- **Helper Functions**: `getTimeLabel()` and similar utilities for consistent data display
- **Functional Updates**: Fixed stale closure issues in promoter dashboard
- **Memory Management**: Proper cleanup and optimization across all components

## 🎯 Key Workflows

1. **Event Creation**: Promoters create gigs with band lineups and requirements
2. **Artist Onboarding**: Bands join events with set times and revenue expectations
3. **Venue Coordination**: Locations manage capacity and technical requirements
4. **Ticket Sales**: Fans purchase tickets through the platform
5. **Event Execution**: Door staff scan tickets and manage entry

## 📱 Mobile Support

### Cross-Platform Development
- **Capacitor Integration**: Native mobile app development for Android and iOS
- **Shared Codebase**: Single codebase for web and mobile applications
- **Native Features**: Access to device APIs (camera, file system, notifications)
- **Performance**: Optimized for mobile devices with efficient rendering

### Mobile-Specific Features
- **Door Scanner App**: Dedicated mobile interface for door staff
- **Touch-Optimized UI**: Large touch targets and gesture support
- **Offline Capability**: Basic functionality available without internet connection
- **Push Notifications**: Real-time updates for events and bookings

### Development Workflow
- **Hot Reload**: Instant updates during development
- **Device Testing**: Live testing on physical devices and simulators
- **App Store Ready**: Configured for both Google Play Store and Apple App Store
- **Responsive Design**: Seamless experience across all screen sizes

## 🚀 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled with proper type definitions
- **Component Structure**: Functional components with hooks
- **Styling**: Tailwind CSS with consistent design tokens
- **State Management**: React hooks with proper dependency arrays
- **Performance**: Memoization for expensive operations

### Git Workflow
- **Branching**: Feature branches for new development
- **Commits**: Conventional commit messages for clear history
- **Code Review**: All changes require review before merging
- **Testing**: Comprehensive testing before deployment

### File Organization
- **Components**: Organized by feature with clear naming conventions
- **Types**: Centralized type definitions in `lib/types.ts`
- **Utilities**: Shared functions in `lib/utils.ts`
- **Assets**: Optimized images with proper fallbacks

### Current Development Status
- **Location Dashboard**: ✅ Fully functional with gig posting capabilities and comprehensive calendar system
- **Promoter Dashboard**: ✅ Multi-venue management with optimized performance and functional state updates
- **Artist Dashboard**: ✅ Gig discovery and booking with memoized data and optimized rendering
- **Fan Dashboard**: ✅ Event discovery and ticket purchasing with performance optimizations
- **Calendar System**: ✅ Complete calendar functionality with availability management and filtering
- **Calendar Enhancements**: ✅ All Dates filter, Today integration, and enhanced visibility implemented
- **Performance Optimizations**: ✅ All major improvements implemented and production-ready
- **Button Styling**: ✅ Purple variant with white font compliance across all components
- **Mobile Development**: ✅ Capacitor integration ready for cross-platform deployment
- **Code Quality**: ✅ Shared constants, helper functions, and clean code practices implemented
- **Data Persistence**: ✅ localStorage integration for calendar availability changes
- **Shared Constants System**: ✅ Centralized form options and helper functions in `src/lib/constants.ts`
- **Code Organization**: ✅ Eliminated duplication with shared TIME_OPTIONS and GENRE_OPTIONS
- **Production Readiness**: ✅ Console statements removed, optimized performance, clean code structure
- **Memory Management**: ✅ Proper cleanup and optimization across all components

## 📚 Learn More

### Documentation
- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
- [shadcn/ui Documentation](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework
- [Capacitor Documentation](https://capacitorjs.com/docs) - Mobile development
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Type system

### Community Resources
- [React Documentation](https://react.dev/) - React framework guide
- [Radix UI Documentation](https://www.radix-ui.com/) - UI primitives
- [Lucide Icons](https://lucide.dev/) - Icon library
- [date-fns Documentation](https://date-fns.org/) - Date utilities

## 🤝 Contributing

We welcome contributions to VENU! Please see our contributing guidelines for:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Mobile development with [Capacitor](https://capacitorjs.com/) 