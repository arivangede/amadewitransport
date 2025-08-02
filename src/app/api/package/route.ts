import { prisma } from "@/lib/prisma";
import { uploadToSupabaseStorage } from "@/lib/upload";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      include: {
        images: true,
        discounts: true,
      },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error Get Packages:", error);
    return NextResponse.json(
      { error: "Failed get packages data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const inclusions = formData.get("inclusions");
    const base_rate = formData.get("base_rate");

    const images = formData.getAll("images") as File[];
    const uploadedImages: string[] = [];

    if (images.length > 0) {
      for (const file of images) {
        const url = await uploadToSupabaseStorage(file, "package");
        uploadedImages.push(url);
      }
    }

    const data = await prisma.package.create({
      data: {
        name: String(name),
        description: String(description),
        inclusions: inclusions ? JSON.parse(String(inclusions)) : [],
        base_rate: parseFloat(String(base_rate)),
        images: {
          create: uploadedImages.map((path) => ({ path })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({
      message: "New package added successfully",
      data,
    });
  } catch (error) {
    console.error("Failed add new package error: ", error);
    return NextResponse.json(
      { error: "Failed add new package" },
      { status: 500 }
    );
  }
}
