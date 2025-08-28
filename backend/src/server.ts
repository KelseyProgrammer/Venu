import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import gigsRoutes from "./routes/gigs.routes.js";
import locationsRoutes from "./routes/locations.routes.js";
import connectDB from "./config/database.js";

dotenv.config();

const app = express();

// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ 
    status: "OK", 
    message: "Mobile LMS API is running",
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/gigs", gigsRoutes);
app.use("/api/locations", locationsRoutes);

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to Mobile LMS API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      gigs: "/api/gigs",
      locations: "/api/locations"
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👥 User endpoints: http://localhost:${PORT}/api/users`);
  console.log(`🎵 Gig endpoints: http://localhost:${PORT}/api/gigs`);
  console.log(`📍 Location endpoints: http://localhost:${PORT}/api/locations`);
  console.log(`\n📋 Key route examples:`);
  console.log(`   Users by role: GET /api/users/by-role/:role`);
  console.log(`   Gigs by status: GET /api/gigs/by-status/:status`);
  console.log(`   Gigs by creator: GET /api/gigs/by-creator/:userId`);
  console.log(`   Location search: GET /api/locations/search/area`);
  console.log(`   Location capacity: GET /api/locations/search/capacity`);
});
