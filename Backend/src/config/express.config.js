import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import multer from 'multer'; // <-- ADDED: Needed for your error handler below
import router from "./router.config.js";
import './db.config.js'


const app = express();

// 1. ADDED: You MUST use cors here so the frontend can talk to the backend!
// Instead of hardcoding one IP (which breaks the moment you switch networks
// or open the app from your phone), we allow any origin coming from
// localhost or a private LAN address on port 5173 (the Vite dev server port).
const LAN_ORIGIN_REGEX = /^http:\/\/((localhost)|(127\.0\.0\.1)|(192\.168\.\d{1,3}\.\d{1,3})|(10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})):5173$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl/Postman) which send no origin header
    if (!origin) return callback(null, true);

    if (LAN_ORIGIN_REGEX.test(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
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
    const value = error.keyValue[key];
    const fieldLabels = {
        sku: "SKU",
    };

    const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

    statusCode = 422;
    status = "VALIDATION_ERROR";
    message = `${label} "${value}" is already in use. Please choose a different one.`;
    errorDetail = {
        [key]: `${label} "${value}" already exists`
    };
}
  }

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