# Development Configuration

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

## Development Workflow

1. **Start both servers** using one of the methods above
2. **Frontend**: http://localhost:3000
3. **Backend API**: http://localhost:3001
4. **API Health Check**: http://localhost:3001/health

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
