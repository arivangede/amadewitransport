import z from "zod";

export const UnitSchema = z.object({
  name: z.string().min(2).max(100).nonempty(),
  year: z
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future")
    .nonnegative(),
  capacity: z.number().min(1),
  inclusions: z
    .array(
      z.object({
        item: z.string().min(1, "Item name is required"),
        description: z.string().optional(),
      })
    )
    .optional(),
  base_rate: z.number().min(0, "Base rate must be 0 or greater"),
  description: z.string().nullable().optional(),
  images: z.array(z.instanceof(File)).optional(),
});
