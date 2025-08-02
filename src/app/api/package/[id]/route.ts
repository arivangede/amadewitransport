import { prisma } from "@/lib/prisma";
import { removeFileInSupabaseStorage } from "@/lib/removeUpload";
import { uploadToSupabaseStorage } from "@/lib/upload";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params;
    const packageData = await prisma.package.findUnique({
      where: { id: Number(packageId) },
      include: { images: true, discounts: true },
    });

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(packageData);
  } catch (error) {
    console.error("Failed get package error: ", error);
    return NextResponse.json(
      { error: "Failed get package data" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params;
    const formData = await req.formData();

    const name: string = String(formData.get("name"));
    const description: string = String(formData.get("description"));
    const inclusions: string = String(formData.get("inclusions"));
    const base_rate: number = parseFloat(String(formData.get("base_rate")));

    const images: File[] = formData.getAll("images") as File[];

    let removedImages: { id: number }[] = [];
    const removeImagesRaw = formData.get("remove_image_ids");
    if (typeof removeImagesRaw === "string") {
      try {
        removedImages = JSON.parse(removeImagesRaw);
      } catch (error) {
        console.error(error);
        removedImages = [];
      }
    }

    // remove images from database and storage
    if (removedImages.length > 0) {
      for (const img of removedImages) {
        if (img && typeof img === "object" && typeof img.id === "number") {
          const image = await prisma.packageImage.findUnique({
            where: { id: img.id },
          });
          if (image) {
            await removeFileInSupabaseStorage(image.path, "package");
            await prisma.packageImage.delete({
              where: { id: image.id },
            });
          }
        }
      }
    }

    // upload new images into storage
    const uploadedImages: string[] = [];
    for (const file of images) {
      const url = await uploadToSupabaseStorage(file, "package");
      uploadedImages.push(url);
    }

    // update unit
    const updatedPackage = await prisma.package.update({
      where: { id: Number(packageId) },
      data: {
        name: name,
        description: description,
        inclusions: inclusions ? JSON.parse(inclusions) : [],
        base_rate: base_rate,
        images: {
          create: uploadedImages.map((path) => ({ path })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({
      message: "Package updated successfully",
      updatedPackage,
    });
  } catch (error) {
    console.error("Error when update package:", error);
    return NextResponse.json(
      {
        error: "Failed to update package data",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detail: (error as any)?.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packageId } = await params;

    const images = await prisma.packageImage.findMany({
      where: { package_id: Number(packageId) },
    });
    if (images.length > 0) {
      for (const img of images) {
        await removeFileInSupabaseStorage(img.path, "package");
        await prisma.packageImage.delete({ where: { id: img.id } });
      }
    }

    await prisma.package.delete({
      where: { id: Number(packageId) },
    });

    return NextResponse.json({
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Error when removing package:", error);
    return NextResponse.json(
      { error: "Failed to remove package" },
      { status: 500 }
    );
  }
}
