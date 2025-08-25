# VENU - Live Music Venue Booking Platform

A comprehensive platform for managing live music events, connecting artists, promoters, venues, and fans. Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## 🎵 What is VENU?

VENU is "The Transparent Booking Platform for Live Music" that streamlines the entire process of organizing and attending live music events. From initial booking to door management, VENU provides tools for every stakeholder in the live music ecosystem.

## ✨ Features

### For Artists
- Artist dashboard for managing gigs and performances
- Set time and percentage tracking
- Genre and requirement management
- Performance scheduling and coordination

### For Promoters
- Promoter dashboard for event management
- Band booking and coordination
- Revenue sharing and guarantee management
- Event promotion tools

### For Venues
- Location dashboard for venue management
- Capacity and scheduling management
- Equipment and requirement tracking
- Door person coordination

### For Fans
- Ticket purchasing system
- Event discovery and information
- Seamless booking experience

### For Door Staff
- Door scanner application
- Ticket validation and entry management
- Real-time attendance tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd VENU
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── artist/            # Artist dashboard pages
│   ├── promoter/          # Promoter dashboard pages
│   ├── location/          # Venue management pages
│   ├── fan/               # Fan experience pages
│   ├── door/              # Door scanner application
│   ├── ticket/            # Ticket purchasing system
│   ├── get-started/       # Onboarding flow
│   ├── learn-more/        # Information pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page with splash screen
├── components/             # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── artist-dashboard.tsx
│   ├── promoter-dashboard.tsx
│   ├── location-dashboard.tsx
│   ├── fan-dashboard.tsx
│   ├── door-scanner.tsx
│   ├── ticket-purchase.tsx
│   ├── onboarding-flow.tsx
│   ├── auth-flow.tsx
│   └── splash-screen.tsx
└── lib/                   # Utility functions and types
    ├── types.ts           # Core business logic types
    ├── location-data.ts   # Venue data
    └── utils.ts           # Utility functions
```

## 🎨 Design System

- **Colors**: Purple variant with white font for all non-navigation buttons
- **Components**: Built with shadcn/ui for consistency and accessibility
- **Styling**: Tailwind CSS with custom design tokens
- **Theme**: Dark mode support with next-themes

## 🔧 Adding shadcn/ui Components

To add new shadcn/ui components:

1. Use the shadcn CLI:
```bash
npx shadcn@latest add [component-name]
```

2. Or manually create components following the shadcn/ui patterns in the `src/components/ui/` directory.

## 📊 Core Business Logic

The platform manages:
- **Gigs**: Complete event information including bands, requirements, and logistics
- **Bands**: Artist information, set times, and revenue sharing
- **Requirements**: Equipment and technical needs for events
- **Tickets**: Capacity management and sales tracking
- **Locations**: Venue details and availability

## 🎯 Key Workflows

1. **Event Creation**: Promoters create gigs with band lineups and requirements
2. **Artist Onboarding**: Bands join events with set times and revenue expectations
3. **Venue Coordination**: Locations manage capacity and technical requirements
4. **Ticket Sales**: Fans purchase tickets through the platform
5. **Event Execution**: Door staff scan tickets and manage entry

## 🚀 Mobile Support

- Capacitor integration for cross-platform mobile development
- Android and iOS builds configured
- Responsive web design for all screen sizes

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)

## 📄 License

This project is licensed under the MIT License. 