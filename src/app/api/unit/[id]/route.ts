import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { uploadToSupabaseStorage } from "@/lib/upload";
import IncomingForm from "formidable/Formidable";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const unit = await prisma.unit.findUnique({
    where: { id: Number(params.id) },
    include: { images: true },
  });

  if (!unit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(unit);
}

function parseForm(req: any): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: true, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const { fields, files } = await parseForm(req as any);

  const { name, year, capacity, base_rate, description } = fields;

  // Hapus gambar lama dari Supabase
  const oldImages = await prisma.unitImage.findMany({
    where: { unit_id: id },
  });

  const oldPaths = oldImages.map((img) => img.path.split("/").pop()!);
  if (oldPaths.length > 0) {
    await supabase.storage.from("unit").remove(oldPaths);
  }

  // Upload gambar baru
  const fileArray = Array.isArray(files.images) ? files.images : [files.images];
  const uploadedImages: string[] = [];

  for (const file of fileArray) {
    const url = await uploadToSupabaseStorage(file);
    uploadedImages.push(url);
  }

  // Update Unit dan gambar-gambarnya
  const updated = await prisma.unit.update({
    where: { id },
    data: {
      name: String(name),
      year: parseInt(year),
      capacity: parseInt(capacity),
      base_rate: parseFloat(base_rate),
      description: description ? String(description) : null,
      images: {
        deleteMany: {},
        create: uploadedImages.map((path) => ({ path })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json({
    message: "Unit updated successfully",
    updated,
  });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  const images = await prisma.unitImage.findMany({ where: { unit_id: id } });
  const filenames = images.map((img) => img.path.split("/").pop()!);

  if (filenames.length > 0) {
    await supabase.storage.from("unit").remove(filenames);
  }

  await prisma.unit.delete({ where: { id } });

  return NextResponse.json({ message: "Unit deleted successfully" });
}
