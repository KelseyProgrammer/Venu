import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import gigsRoutes from "./routes/gigs.routes.js";
import locationsRoutes from "./routes/locations.routes.js";
import artistsRoutes from "./routes/artists.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import connectDB from "./config/database.js";
import { setupOptimizedSocketHandlers } from "./socket/socketHandlers.js";
import { ClientToServerEvents, ServerToClientEvents } from "./socket/types.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ 
    status: "OK", 
    message: "Mobile LMS API is running",
    timestamp: new Date().toISOString()
  });
});

// API routes
console.log('🔧 Registering API routes...');
app.use("/api/auth", authRoutes);
console.log('✅ Auth routes registered');
app.use("/api/users", usersRoutes);
console.log('✅ User routes registered');
app.use("/api/gigs", gigsRoutes);
console.log('✅ Gig routes registered');
app.use("/api/locations", locationsRoutes);
console.log('✅ Location routes registered');
app.use("/api/artists", artistsRoutes);
console.log('✅ Artist routes registered');
app.use("/api/upload", uploadRoutes);
console.log('✅ Upload routes registered');

// Serve uploaded files at /uploads path for compatibility
app.use("/uploads", express.static(path.join(process.cwd(), 'uploads')));
console.log('✅ Upload file serving registered');
console.log('🔧 All routes registered successfully');

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to Mobile LMS API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      gigs: "/api/gigs",
      locations: "/api/locations",
      artists: "/api/artists",
      upload: "/api/upload"
    }
  });
});

// 404 handler
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

// Global error handler
app.use((error: any, _req: Request, res: Response, _next: any) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Setup optimized Socket.IO handlers
    setupOptimizedSocketHandlers(io);
    console.log('✅ Optimized Socket.IO handlers configured');
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log('Server running on port', PORT);
      console.log('API available at http://localhost:' + PORT);
      console.log('Socket.IO server ready for real-time connections');
      console.log('Server startup complete - ready to accept requests');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
