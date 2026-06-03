import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import multer from 'multer'; // <-- ADDED: Needed for your error handler below
import router from "./router.config.js";

const app = express();

// 1. ADDED: You MUST use cors here so the frontend can talk to the backend!
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend URL
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health Check Route
app.use("/health", (req, res) => {
  res.json({
    data: "health",
    message: "success",
    status: "ok",
    option: null
  });
});

// 2. ADDED: Attach your main router so your auth routes actually work!
// If your frontend sends requests to "/api/auth/...", change "/" to "/api" below.
app.use("/", router);

// 404 Route Handler (Runs if no other route matches)
app.use((req, res, next)=>{
  next({
    code: 404,
    message: "Route not found",
    status: "Route_error"
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.log(error);

  let statusCode = 500;
  let message = error.message || "Internal Server Error";
  let status = error.status || "SERVER_ERROR";
  let errorDetail = error.error || null;

  if (error.name === "MongoServerError") {
    statusCode = 422; 
    status = "DATABASE_ERROR";

    if (error.code === 11000) {
      const key = Object.keys(error.keyPattern)[0]; 
      statusCode = 422; 
      errorDetail = {
        [key]: `${key} has already been used`
      };
      message = "Unique Validation failed";
      status = "VALIDATION_ERROR";
    }
  }

  // Multer errors (This works safely now because multer is imported at the top!)
  if (error instanceof multer.MulterError) {
    statusCode = 400;

    if (error.code === "LIMIT_FILE_SIZE") {
      message = "File size is too large";
      status = "FILE_TOO_LARGE";
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
      status = "UNEXPECTED_FILE";
    }
  }

  if (typeof error.code === "number" && error.code >= 100 && error.code < 600) {
    statusCode = error.code;
  }
  
  res.status(statusCode).json({
    error: errorDetail,
    message,
    status,
    option: null
  });
});

export default app;