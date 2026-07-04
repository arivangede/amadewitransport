import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { signToken, verifyToken } from "../lib/auth";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const token = await signToken({ id: user.id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({ message: "Login success", user });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = await signToken({ id: user.id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 1000,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({ message: "Register Success", user });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ user: null });

    const decoded = await verifyToken(token);
    if (!decoded || typeof decoded !== "object") {
      return res.status(401).json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: (decoded as { id: number }).id },
      select: { id: true, email: true, name: true },
    });

    return res.json({ user });
  } catch (error) {
    console.error("ME ERROR:", error);
    return res.status(500).json({ user: null });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.cookie("token", "", { maxAge: 0, path: "/" });
  return res.json({ message: "Logged out successfully" });
});

export default router;
