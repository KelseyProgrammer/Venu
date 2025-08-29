# VENU - Live Music Venue Booking Platform

A comprehensive platform for managing live music events, connecting artists, promoters, venues, and fans. Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui for modern web development.

## 🎵 What is VENU?

VENU is "The Transparent Booking Platform for Live Music" that streamlines the entire process of organizing and attending live music events. From initial booking to door management, VENU provides tools for every stakeholder in the live music ecosystem with a focus on transparency, efficiency, and user experience.

## ✨ Features

### For Artists
- **Artist Profile Management**: Create and manage comprehensive artist profiles with bio, genres, social links, and pricing
- **Artist Dashboard**: Comprehensive gig management and performance tracking
- **Gig Discovery**: Browse available opportunities with detailed requirements
- **Set Time Management**: Schedule performances with automatic time slot coordination
- **Revenue Tracking**: Monitor earnings, guarantees, and percentage-based payouts
- **Application System**: Apply to gigs with portfolio and requirements matching
- **Performance Analytics**: Track attendance, ratings, and repeat booking rates
- **Social Media Integration**: Connect Spotify, Apple Music, Instagram, and website links
- **Location & Availability**: Set location preferences and availability status
- **Genre & Style**: Define musical genres and artistic style for better matching

### For Promoters
- **Multi-Venue Management**: Handle multiple venues from a single dashboard
- **Artist Discovery**: Search and filter artists by genre, location, rating, and availability
- **Gig Posting System**: Create detailed events with band requirements and payout structures
- **Artist Coordination**: Manage applications, confirmations, and communication
- **Revenue Management**: Set guarantees, bonus tiers, and percentage distributions
- **Cross-Venue Analytics**: Consolidated performance metrics across all venues
- **Event Promotion**: Built-in tools for marketing and ticket sales tracking
- **Artist Booking**: Browse and book artists with comprehensive profile information

### For Venues (Locations)
- **Location Dashboard**: Complete venue management with comprehensive calendar system
- **Artist Discovery**: Search and book artists with detailed profiles and availability
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
- **Comprehensive Search**: Unified search across artists, venues, and events with real-time filtering
- **Artist Discovery**: Browse local artists with streaming links (Spotify, Apple Music) and social media
- **Venue Exploration**: Discover venues with Instagram links, capacity info, and genre specialties
- **Event Discovery**: Browse upcoming shows with genre-based filtering and visual event cards
- **Smart Filtering**: Dynamic genre filters with purple-themed UI for active selections
- **Ticket Purchasing**: Seamless booking experience with secure payment processing
- **Event Information**: Detailed show information including lineup, times, and venue details
- **Favorites System**: Save preferred artists and venues for personalized recommendations
- **Ticket Management**: Digital ticket storage and easy access for events
- **Responsive Design**: Optimized experience across desktop, tablet, and mobile devices

### For Door Staff
- **Door Scanner App**: Mobile application for ticket validation and entry management
- **Real-Time Attendance**: Live tracking of ticket sales and venue capacity
- **Guest List Management**: Handle VIP lists and special access requirements
- **Event Coordination**: Access to event details, timing, and special instructions

## 🏗️ Project Architecture

VENU is built as a **full-stack application** with:

- **Frontend**: Next.js 14.2.32 with React 18.3.1, TypeScript 5, and Tailwind CSS 3.4.17
- **Backend**: Node.js with Express 4.21.2 and TypeScript 5.9.2
- **Database**: MongoDB Atlas (cloud database) with Mongoose 8.17.1 and optimized indexing
- **Authentication**: JWT-based authentication system with bcryptjs 3.0.2 and secure configuration
- **UI Components**: shadcn/ui component library built on Radix UI primitives (latest versions)
- **Forms**: React Hook Form 7.60.0 with Zod 3.25.67 validation
- **Icons**: Lucide React 0.454.0 for consistent iconography
- **Charts**: Recharts 2.15.4 for data visualization
- **Date Handling**: date-fns 4.1.0 for date manipulation
- **Security**: Rate limiting, error handling, and input sanitization
- **Performance**: Optimized database queries with parallel operations and lean queries
- **Code Quality**: Comprehensive TypeScript interfaces and performance optimizations

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (Recommended: Node.js 20+)
- **npm** or **yarn** package manager
- **Git** for version control
- **MongoDB** (local installation recommended for development)
- **Homebrew** (for macOS MongoDB installation)

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd VENU
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd backend
npm install
cd ..
```

4. **Install and start MongoDB:**
   
   **For macOS (using Homebrew):**
   ```bash
   # Install MongoDB Community Edition
   brew install mongodb-community
   
   # Start MongoDB service
   brew services start mongodb/brew/mongodb-community
   
   # Verify MongoDB is running
   brew services list | grep mongodb
   mongosh --eval "db.runCommand('ping')" --quiet
   ```
   
   **For other platforms:**
   - [Windows MongoDB Installation](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
   - [Linux MongoDB Installation](https://docs.mongodb.com/manual/administration/install-on-linux/)

5. **Set up environment variables:**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   # Database Configuration (Local MongoDB)
   MONGODB_URI=mongodb://localhost:27017/venu
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   JWT_ISSUER=venu-api
   JWT_AUDIENCE=venu-app
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

### Running the Application

#### Option 1: Quick Start (Recommended)
Use the provided startup scripts to run both servers simultaneously:

**For macOS/Linux:**
```bash
./start-dev.sh
```

**For Windows:**
```bash
start-dev.bat
```

#### Option 2: Manual Start
1. **Start the backend server:**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3001`

2. **Start the frontend (in a new terminal):**
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`

#### Option 3: Using npm scripts
```bash
# Start both servers simultaneously
npm run dev:both

# Or start them individually
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Troubleshooting

### Common Issues and Solutions

#### MongoDB Connection Issues

**Error: `MongooseServerSelectionError: connect ECONNREFUSED ::1:27017`**
- **Cause:** MongoDB is not running
- **Solution:** Start MongoDB service:
  ```bash
  brew services start mongodb/brew/mongodb-community
  ```

**Error: `mongod not found`**
- **Cause:** MongoDB is not installed
- **Solution:** Install MongoDB:
  ```bash
  brew install mongodb-community
  ```

**Error: `Error: listen EADDRINUSE: address already in use :::3001`**
- **Cause:** Port 3001 is already in use
- **Solution:** Kill existing processes or change port in `.env` file

#### Verification Steps

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

#### Environment Variables Issues

**Error: `MONGODB_URI is not defined in environment variables`**
- **Cause:** `.env` file is missing or incorrectly formatted
- **Solution:** Ensure `.env` file exists in `backend/` directory with correct format

**Error: `JWT_SECRET is not defined`**
- **Cause:** JWT configuration is missing
- **Solution:** Add JWT configuration to `.env` file

## 🔧 Development Scripts

### Root Level (Frontend + Backend)
- `npm run dev` - Start frontend on port 3000
- `npm run dev:frontend` - Start frontend on port 3000
- `npm run dev:backend` - Start backend on port 3001
- `npm run dev:both` - Start both servers simultaneously (requires `concurrently`)

### Frontend Only
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend Only
- `npm run dev` - Start development server with nodemon on port 3001
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server on port 3001

### Startup Scripts
- `./start-dev.sh` - Start both servers (macOS/Linux)
- `start-dev.bat` - Start both servers (Windows)

## 🌐 API Endpoints

The backend provides RESTful API endpoints with comprehensive security and validation:

### Authentication & Users
- **Authentication**: `/api/auth/*` - User registration, login, profile management
- **Users**: `/api/users/*` - User CRUD operations and role management with admin controls

### Artist Management
- **Artists**: `/api/artists/*` - Artist profile CRUD operations with search and filtering
  - Public endpoints for artist discovery and search
  - Protected endpoints for profile management
  - Advanced filtering by genre, location, and rating
  - Comprehensive search across name, bio, and genres
  - Optimized pagination with parallel database queries

### Events & Venues
- **Gigs**: `/api/gigs/*` - Event creation, management, and booking with promoter controls
- **Locations**: `/api/locations/*` - Venue management and availability with search capabilities

### Security Features
- **Rate Limiting**: Protection against abuse with configurable limits
- **Input Validation**: Comprehensive Zod schema validation for all endpoints
- **Error Handling**: Typed error responses with proper logging
- **Authentication**: JWT-based security with role-based access control
- **Performance**: Optimized database queries with lean operations and parallel processing

## 📱 Mobile Development Strategy

**Current Status**: VENU is built as a modern web application using Next.js 14 with responsive design for optimal cross-device compatibility.

**Future Plans**: The responsive web design serves as a foundation for future mobile app development, ensuring consistent user experience across all platforms.

## 🎨 Design System

- **Color Scheme**: Purple-based theme with white text for primary actions
- **Typography**: Modern, readable fonts optimized for mobile and desktop
- **Components**: Consistent UI patterns using shadcn/ui component library
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Component Architecture**: Modular, reusable components for maintainable code
- **Performance**: Optimized rendering with proper memoization and code splitting
- **Accessibility**: WCAG compliant components with proper ARIA labels
- **Theme Consistency**: Enforced purple button styling for all non-navigation actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository or contact the development team. 