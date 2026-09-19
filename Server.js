const express = require("express");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const authRoutes = require("./routes/auth");
const connectDB = require("./config/db");

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "User Authentication API is running",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      profile: "GET /api/auth/profile (Requires Bearer Token)",
    },
  });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 8000;

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    return server;
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;