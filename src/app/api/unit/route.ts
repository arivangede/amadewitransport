import { parseIDRPrice } from "@/lib/parsePrice";
import { prisma } from "@/lib/prisma";
import { uploadToSupabaseStorage } from "@/lib/upload";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const units = await prisma.unit.findMany({
    include: { images: true, discounts: true },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json(units);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const year = formData.get("year");
    const capacity = formData.get("capacity");
    const base_rate = formData.get("base_rate");
    const description = formData.get("description");
    const inclusions = formData.get("inclusions");

    const images = formData.getAll("images") as File[];

    const uploadedImages: string[] = [];

    if (images.length > 0) {
      for (const file of images) {
        const url = await uploadToSupabaseStorage(file);
        uploadedImages.push(url);
      }
    }

    const unit = await prisma.unit.create({
      data: {
        name: String(name),
        year: parseInt(String(year)),
        capacity: parseInt(String(capacity)),
        base_rate: parseFloat(String(base_rate)),
        description: description ? String(description) : null,
        inclusions: inclusions ? JSON.parse(String(inclusions)) : [],
        images: {
          create: uploadedImages.map((path) => ({ path })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json({
      message: "New unit added successfully",
      unit,
    });
  } catch (error) {
    console.error("Failed add new unit error: ", error);
    return NextResponse.json(
      {
        error: "Failed add new Unit",
      },
      { status: 500 }
    );
  }
}
