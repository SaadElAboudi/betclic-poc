import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser tools (curl/postman) and same-origin requests
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Betclic POC Backend running on http://localhost:${PORT}`);
    console.log(`📊 API routes available at http://localhost:${PORT}/api`);
});
