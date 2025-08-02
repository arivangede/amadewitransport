import { prisma } from "@/lib/prisma";
import { removeFileInSupabaseStorage } from "@/lib/removeUpload";
import { uploadToSupabaseStorage } from "@/lib/upload";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: unitId } = await params;
  const unit = await prisma.unit.findUnique({
    where: { id: Number(unitId) },
    include: { images: true, discounts: true },
  });

  if (!unit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(unit);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;
    const formData = await req.formData();

    const name = formData.get("name");
    const year = formData.get("year");
    const capacity = formData.get("capacity");
    const base_rate = formData.get("base_rate");
    const description = formData.get("description");
    const inclusions = formData.get("inclusions");

    const images = formData.getAll("images") as File[];

    let removedImages: { id: number }[] = [];
    const removeImagesRaw = formData.get("remove_image_ids");
    if (typeof removeImagesRaw === "string") {
      try {
        removedImages = JSON.parse(removeImagesRaw);
      } catch (e) {
        console.error(e);
        removedImages = [];
      }
    }

    // Hapus gambar dari database dan storage
    for (const img of removedImages) {
      if (img && typeof img === "object" && typeof img.id === "number") {
        const image = await prisma.unitImage.findUnique({
          where: { id: img.id },
        });
        if (image) {
          await removeFileInSupabaseStorage(image.path, "unit");
          await prisma.unitImage.delete({
            where: { id: image.id },
          });
        }
      }
    }

    // Upload gambar baru ke storage
    const uploadedImages: string[] = [];
    for (const file of images) {
      const url = await uploadToSupabaseStorage(file);
      uploadedImages.push(url);
    }

    // Update unit
    const unit = await prisma.unit.update({
      where: { id: Number(unitId) },
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
      message: "Unit updated successfully",
      unit,
    });
  } catch (error) {
    console.error("Error when update unit:", error);
    return NextResponse.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { error: "Failed to update unit data", detail: (error as any)?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    // get and remove images data
    const images = await prisma.unitImage.findMany({
      where: { unit_id: Number(unitId) },
    });
    if (images.length > 0) {
      for (const img of images) {
        await removeFileInSupabaseStorage(img.path, "unit");
        await prisma.unitImage.delete({ where: { id: img.id } });
      }
    }

    // remove unit data
    await prisma.unit.delete({ where: { id: Number(unitId) } });

    return NextResponse.json({ message: "Unit deleted successfully" });
  } catch (error) {
    console.error("Error when removing Unit:", error);
    return NextResponse.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { error: "Failed to remove Unit", detail: (error as any)?.message },
      { status: 500 }
    );
  }
}
