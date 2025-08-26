# VENU Frontend - Next.js Mobile App

This is the frontend mobile application for VENU, built with Next.js 14 and Capacitor for cross-platform mobile development.

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (Recommended: Node.js 20+)
- **npm** or **yarn** package manager
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Mobile Development

### Capacitor Setup

This project uses Capacitor for cross-platform mobile development, allowing you to build native Android and iOS apps from the same codebase.

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

### Available Scripts

#### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

#### Mobile Development
- `npx cap sync` - Sync web assets to mobile platforms
- `npx cap run android` - Run on Android device/emulator
- `npx cap run ios` - Run on iOS device/simulator
- `npx cap build android` - Build Android APK
- `npx cap build ios` - Build iOS app

## 🏗️ Project Structure

```
frontend/
├── src/                           # Source code
│   ├── app/                       # Next.js App Router
│   │   ├── globals.css           # Global styles and CSS variables
│   │   ├── layout.tsx            # Root layout with providers
│   │   └── page.tsx              # Home page
├── android/                       # Android-specific files
│   ├── app/                      # Android app configuration
│   └── build.gradle              # Android build configuration
├── ios/                          # iOS-specific files
│   ├── App/                      # iOS app configuration
│   └── App.xcodeproj/            # Xcode project files
├── capacitor.config.ts           # Capacitor configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## 🎨 Technology Stack

### Frontend Framework
- **Next.js 14.2.32**: React framework with App Router
- **TypeScript 5+**: Type-safe development with strict mode
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI

### Mobile Development
- **Capacitor**: Cross-platform mobile development framework
- **Android Studio**: Android development environment
- **Xcode**: iOS development environment (macOS only)

### Key Dependencies
- **React 18.3.1**: UI library
- **Lucide React**: Icon library
- **date-fns**: Date manipulation utilities
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Recharts**: Data visualization

## 📱 Mobile Features

### Cross-Platform Support
- **Android**: Native Android app with access to device APIs
- **iOS**: Native iOS app with access to device APIs
- **Shared Codebase**: Single codebase for both platforms

### Native Features
- **Camera Access**: For door scanning and photo capture
- **File System**: Local storage and file management
- **Push Notifications**: Real-time event updates
- **Device APIs**: Access to native device capabilities

### Mobile-Specific Components
- **Door Scanner**: Mobile interface for door staff
- **Touch Optimization**: Large touch targets and gesture support
- **Offline Support**: Basic functionality without internet
- **Responsive Design**: Optimized for mobile screens

## 🔧 Development Workflow

### Hot Reload
- **Web Development**: Instant updates during development
- **Mobile Testing**: Live testing on devices and simulators
- **Cross-Platform**: Changes reflect on both web and mobile

### Build Process
1. **Web Build**: `npm run build` creates optimized web bundle
2. **Capacitor Sync**: `npx cap sync` copies web assets to mobile platforms
3. **Native Build**: Use Android Studio or Xcode for final builds

### Testing
- **Web Testing**: Test in browser during development
- **Device Testing**: Test on physical devices and simulators
- **Cross-Platform**: Ensure functionality works on both platforms

## 📚 Learn More

### Documentation
- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
- [Capacitor Documentation](https://capacitorjs.com/docs) - Mobile development
- [shadcn/ui Documentation](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework

### Community Resources
- [React Documentation](https://react.dev/) - React framework guide
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Type system
- [Lucide Icons](https://lucide.dev/) - Icon library

## 🤝 Contributing

When contributing to the frontend:

1. **Follow the coding standards** defined in the main project
2. **Test on both web and mobile** platforms
3. **Ensure responsive design** works across all screen sizes
4. **Maintain performance** with proper memoization and optimization
5. **Update documentation** for any new features or changes

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.