import { supabase } from "./supabase";

export async function removeFileInSupabaseStorage(
  path: string,
  folder: string = "unit"
): Promise<boolean> {
  const pathFile = getRelativePathFromPublicUrl(path, folder);
  console.log("path", pathFile);
  const { data, error } = await supabase.storage
    .from(folder)
    .remove([pathFile]);

  if (error) {
    throw new Error("Failed when removing file: " + error.message);
  }

  console.log(data);
  return Array.isArray(data) && data.length > 0;
}

// utils/supabase/storage.ts
export function getRelativePathFromPublicUrl(
  publicUrl: string,
  folder: string
): string {
  const url = new URL(publicUrl);
  const pathParts = url.pathname.split(
    `/storage/v1/object/public/${folder}/`
  )[1];
  if (!pathParts) {
    throw new Error("Invalid public URL: Could not extract file path");
  }
  return decodeURIComponent(pathParts);
}
