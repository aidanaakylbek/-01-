import express from "express";
import { supabaseClient } from "../utils/supabase.js";
import { z } from "zod";

const router = express.Router();

// Zod schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/account/register
router.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    const { data, error } = await supabaseClient.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          name: body.name,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: "Registration successful. Please check your email.",
      user: data.user,
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request format",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/account/login
router.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: "Login successful",
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("Login Error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request format",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/account/profile
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authHeader.substring(7);

    const { data, error } = await supabaseClient.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.json({
      user: data.user,
      email: data.user.email,
      name: (data.user.user_metadata?.name as string) || "Student",
    });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// POST /api/account/logout
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
