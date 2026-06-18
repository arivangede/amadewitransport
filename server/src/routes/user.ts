import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// PUT /api/user/account-info
router.put(
  "/account-info",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).user as { id: number };
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { name, email },
      });

      return res.json({ message: "Account info updated", user });
    } catch (error) {
      console.error("Update account error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PUT /api/user/change-password
router.put(
  "/change-password",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).user as { id: number };
      const { old_password, new_password } = req.body;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const passwordMatch = await bcrypt.compare(old_password, user.password);
      if (!passwordMatch) {
        return res
          .status(400)
          .json({ error: "Current Password didn't match with our record" });
      }

      const hash = await bcrypt.hash(new_password, 10);

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: hash },
      });

      return res.json({
        message: "Account password updated",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
