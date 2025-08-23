import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import usersRoutes from "./routes/users.routes";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
// import cors from "cors";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/src/app/layout.tsx"));
  // res.send("Mobile LMS API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
