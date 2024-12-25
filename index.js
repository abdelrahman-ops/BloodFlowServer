import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import Routes
import routes from "./routes/index.js";

// Load environment variables
dotenv.config();

// Get the directory name for ES module support
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
      origin: [
          "http://localhost:5173",
          "https://blood-flow.vercel.app"
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
  })
);
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(morgan("dev")); // Logging
app.use(cookieParser()); // Cookie parsing middleware

// Serve static files for images
app.use("/images", express.static(join(__dirname, "public/images")));
app.use("/public/images", express.static("public/images"));

// API Routes
app.use("/api", routes);

// Base Route
app.get("/", (req, res) => {
  res.send("Welcome to the Blood Donation Management System API!");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});

// Define the port and start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
