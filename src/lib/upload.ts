import { supabase } from "./supabase";

export async function uploadToSupabaseStorage(
  file: any,
  folder: string = "unit"
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(folder)
    .upload(fileName, buffer, {
      contentType: file.type,
    });

  if (error) throw new Error("Upload failed: " + error.message);

  const { data: publicUrl } = supabase.storage
    .from(folder)
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
