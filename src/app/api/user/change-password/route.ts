import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "No token provided" }, { status: 400 });

  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded !== "object") {
    return NextResponse.json({ error: "Token is not valid" }, { status: 400 });
  }

  const { old_password, new_password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: Number((decoded as { id: number }).id) },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordMatch = await bcrypt.compare(old_password, user.password);
  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Current Password didn't match with our record" },
      { status: 404 }
    );
  }

  const hash = await bcrypt.hash(new_password, 10);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: { password: hash },
  });

  return NextResponse.json({
    message: "Account password updated",
    user: updatedUser,
  });
}
