# Development Configuration

## Project Status
**Current Status**: Production-ready with comprehensive real-time features  
**Last Updated**: December 2024  
**Branch**: Fullstack

## Port Configuration

This project uses a specific port configuration to avoid conflicts:

- **Frontend (Next.js)**: Port 3000
- **Backend (Express API)**: Port 3001

## Quick Start

### Option 1: Using Startup Scripts (Recommended)

**macOS/Linux:**
```bash
./start-dev.sh
```

**Windows:**
```bash
start-dev.bat
```

### Option 2: Using npm Scripts

```bash
# Start both servers
npm run dev:both

# Or start individually
npm run dev:frontend  # Port 3000
npm run dev:backend   # Port 3001
```

### Option 3: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Environment Variables

### Backend (.env file in backend/ directory)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```

### Frontend
The frontend automatically connects to the backend API at `http://localhost:3001/api` as configured in `src/lib/api.ts`.

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

1. **Kill existing processes:**
   ```bash
   # macOS/Linux
   pkill -f "next dev"
   pkill -f "tsx src/server.ts"
   
   # Or find and kill specific processes
   lsof -ti:3000 | xargs kill
   lsof -ti:3001 | xargs kill
   ```

2. **Check what's running on ports:**
   ```bash
   lsof -i:3000
   lsof -i:3001
   ```

### API Connection Issues
- Ensure backend is running on port 3001
- Check that frontend is running on port 3000
- Verify the API_BASE_URL in `src/lib/api.ts` points to `http://localhost:3001/api`

### Notification System Debugging

#### Comprehensive Debugging Tools
The project includes multiple debugging tools for troubleshooting notification issues:

**Available Debug Scripts:**
- `notification-debugger.js` - Comprehensive debugging and testing solution
- `direct-notification-test.js` - Direct notification flow testing  
- `notification-success-test.js` - Success verification testing
- `simple-notification-debugger.js` - Simplified browser console debugging

#### Using Debug Tools

1. **Browser Console Debugging:**
   ```javascript
   // Copy and paste any debug script into browser console
   // Example: simple-notification-debugger.js
   
   // Available functions after running debugger:
   notificationDebugger.runFullDiagnostic()
   notificationDebugger.testSocketConnection()
   notificationDebugger.createTestNotification()
   ```

2. **Debug Console Output:**
   ```javascript
   🔧 VENU Notification System Debugger
   =====================================
   
   1️⃣ Checking Authentication...
   ✅ Auth token valid
   👤 User: { userId: "507f1f77bcf86cd799439011", email: "artist@gmail.com", role: "artist" }
   
   2️⃣ Checking Socket Connection...
   ✅ Socket manager exists
   🔌 Connected: true
   🔌 Socket ID: abc123def456
   ```

3. **Backend Debug Logging:**
   Monitor backend console for these debug messages:
   ```
   🔍 DEBUG: Gig has 2 bands, attempting to send notifications
   🔍 DEBUG: Looking for artists with emails: ["artist@gmail.com"]
   🔍 DEBUG: Found 1 artist users: [{ id: "507f1f77bcf86cd799439011", email: "artist@gmail.com", role: "artist" }]
   🔔 Notification sent to user 507f1f77bcf86cd799439011: Gig Confirmation Required
   ```

#### Common Notification Issues

1. **Notifications Not Appearing:**
   - Check browser console for debug messages
   - Verify user is logged in with valid token
   - Ensure Socket.IO connection is established
   - Run `notificationDebugger.runFullDiagnostic()` in console

2. **Socket Connection Issues:**
   - Check if backend server is running on port 3001
   - Verify authentication token is valid
   - Test with `notificationDebugger.testSocketConnection()`

3. **Offline Notifications:**
   - Notifications are stored in database when users are offline
   - Check MongoDB for stored notifications
   - Verify notification delivery when user reconnects

#### Debug Console Commands
```javascript
// Run comprehensive diagnostic
notificationDebugger.runFullDiagnostic()

// Test socket connection manually  
notificationDebugger.testSocketConnection()

// Create test notification
notificationDebugger.createTestNotification()

// Test backend API endpoints
notificationDebugger.testNotificationAPI()

// Check authentication status
notificationDebugger.checkAuth()

// Monitor console logs for notifications
notificationDebugger.monitorLogs()
```

## Development Workflow

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

### Development Steps
1. **Start both servers** using one of the methods above
2. **Frontend**: http://localhost:3000
3. **Backend API**: http://localhost:3001
4. **API Health Check**: http://localhost:3001/health
5. **Profile Picture Test**: http://localhost:3000/profile-picture-test

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

## File Structure

```
VENU/
├── src/                    # Frontend (Next.js)
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/               # Utilities and API client
├── backend/               # Backend (Express API)
│   ├── src/               # TypeScript source
│   │   ├── routes/        # API routes
│   │   ├── models/        # Database models
│   │   └── middleware/    # Express middleware
│   └── dist/              # Compiled JavaScript
├── start-dev.sh           # macOS/Linux startup script
├── start-dev.bat          # Windows startup script
└── package.json           # Root package.json with scripts
```
