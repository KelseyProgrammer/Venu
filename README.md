# VENU - Live Music Venue Booking Platform

A comprehensive platform for managing live music events, connecting artists, promoters, venues, and fans. Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui for modern web development.

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

## 🏗️ Project Architecture

VENU is built as a **full-stack application** with:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Node.js/Express API with TypeScript
- **Database**: MongoDB Atlas (cloud database)
- **Authentication**: JWT-based authentication system
- **UI Components**: shadcn/ui component library built on Radix UI

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (Recommended: Node.js 20+)
- **npm** or **yarn** package manager
- **Git** for version control
- **MongoDB Atlas account** (or local MongoDB installation)

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

4. **Set up environment variables:**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

### Running the Application

1. **Start the backend server:**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:4000`

2. **Start the frontend (in a new terminal):**
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server

## 🌐 API Endpoints

The backend provides RESTful API endpoints for:

- **Authentication**: `/api/auth/*` - User registration, login, profile management
- **Users**: `/api/users/*` - User CRUD operations and role management
- **Gigs**: `/api/gigs/*` - Event creation, management, and booking
- **Locations**: `/api/locations/*` - Venue management and availability

## 📱 Mobile Development Strategy

**Current Status**: VENU is built as a modern web application using Next.js 14 with responsive design for optimal cross-device compatibility.

**Future Plans**: The responsive web design serves as a foundation for future mobile app development, ensuring consistent user experience across all platforms.

## 🎨 Design System

- **Color Scheme**: Purple-based theme with white text for primary actions
- **Typography**: Modern, readable fonts optimized for mobile and desktop
- **Components**: Consistent UI patterns using shadcn/ui component library
- **Responsive Design**: Mobile-first approach with progressive enhancement

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