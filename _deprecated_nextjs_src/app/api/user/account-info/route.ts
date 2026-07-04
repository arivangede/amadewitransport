import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "No token provided" }, { status: 400 });

  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded !== "object") {
    return NextResponse.json({ error: "Token is not valid" }, { status: 400 });
  }

  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: {
      id: Number((decoded as { id: number }).id),
    },
    data: { name, email },
  });

  return NextResponse.json({
    message: "Account info updated",
    user,
  });
}
