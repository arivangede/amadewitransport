import { supabase } from "./supabase";

export async function uploadToSupabaseStorage(
  file: Express.Multer.File,
  folder: string = "unit",
) {
  const buffer = file.buffer;
  const fileName = `${Date.now()}-${file.originalname}`;
  const { data, error } = await supabase.storage
    .from(folder)
    .upload(fileName, buffer, {
      contentType: file.mimetype,
    });

  if (error) throw new Error("Upload failed: " + error.message);

  const { data: publicUrl } = supabase.storage
    .from(folder)
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
