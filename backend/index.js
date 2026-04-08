import dotenv from "dotenv";
dotenv.config(); // MUST BE FIRST

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.route.js";
import promtRoutes from "./routes/promt.route.js";
import chatRoutes from "./routes/chat.route.js";
import fileRoutes from "./routes/file.route.js";

const app = express();
const port = process.env.PORT || 4001;
const MONGO_URL = process.env.MONGO_URI;

// middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://deepseek-ai-clone-zexi.onrender.com', 'https://landing-page-bl7r.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Root route (IMPORTANT for Render test)
app.get("/", (req, res) => {
  res.send("Server running on Render 🚀");
});

// DB Connection
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB Connection Error: ", error));

// routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/deepseekai", promtRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/file", fileRoutes);

// start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});