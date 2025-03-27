import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.routes.js";
import challengeRoutes from "./routes/challenge.routes.js";
import { app, server } from "./lib/socket.js";

// Force console output for Windows/WSL environment
process.stdout.write("Server starting...\n");

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  process.stdout.write(`UNCAUGHT EXCEPTION: ${err}\n`);
  console.error('UNCAUGHT EXCEPTION:', err);
});

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Write directly to stdout for WSL environment
process.stdout.write(`Environment loaded. PORT: ${PORT}\n`);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : true,
    credentials: true,
  })
);

process.stdout.write("Middleware configured\n");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);

process.stdout.write("Routes configured\n");

// Static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
  process.stdout.write("Static files configured for production\n");
}

// Start server
try {
  server.listen(PORT, () => {
    const message = `Server running on port ${PORT}`;
    console.log(message);
    process.stdout.write(message + "\n");
    
    connectDB().then(() => {
      process.stdout.write("MongoDB connection attempt completed\n");
    }).catch(err => {
      process.stdout.write(`MongoDB connection error: ${err.message}\n`);
    });
  });
} catch (err) {
  process.stdout.write(`Server start error: ${err}\n`);
  console.error("Server start error:", err);
}
