"use client";
import z from "zod";

export const PackageSchema = z.object({
  name: z
    .string()
    .min(2, "Package name must be 2 or more character")
    .max(100, "Package name cannot be more than 100 character")
    .nonempty(),
  description: z.string().nullable().optional(),
  inclusions: z
    .array(
      z.object({
        item: z.string().min(1, "Item name is required"),
        description: z.string().optional(),
      })
    )
    .optional(),
  base_rate: z.number().min(0, "Base rate must be 0 or greater"),
  images: z.array(z.instanceof(File)).optional(),
});
