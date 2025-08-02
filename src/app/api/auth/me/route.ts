import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded !== "object") {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: (decoded as { id: number }).id,
    },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({ user });
}
