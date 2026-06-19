import express from "express";

const router = express.Router();

// GET /api/health
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// GET /api/health/ready
router.get("/ready", (req, res) => {
  const checks = {
    supabase: !!process.env.SUPABASE_URL,
    openai: !!process.env.OPENAI_API_KEY,
    jwt: !!process.env.JWT_SECRET,
  };

  const allReady = Object.values(checks).every((check) => check);

  res.status(allReady ? 200 : 503).json({
    ready: allReady,
    checks,
  });
});

export default router;
