import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Routes
import chatRoutes from "./routes/chat.js";
import accountRoutes from "./routes/account.js";
import healthRoutes from "./routes/health.js";

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "../.env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

// Log loaded variables
console.log("Environment:", process.env.NODE_ENV);
console.log("Supabase URL:", process.env.SUPABASE_URL ? "✓" : "✗");
console.log("OpenAI Key:", process.env.OPENAI_API_KEY ? "✓" : "✗");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/health", healthRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "AulBridge Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      chat: "/api/chat",
      account: "/api/account",
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AulBridge Backend running on http://localhost:${PORT}`);
  console.log(`📝 Docs at http://localhost:${PORT}/api`);
});

export default app;
