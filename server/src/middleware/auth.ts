import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const decoded = await verifyToken(token);

  if (!decoded || typeof decoded !== "object") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Attach user info to request for downstream handlers
  (req as any).user = decoded;
  next();
}
