import z from "zod";

export const PromotionSchema = z
  .object({
    name: z
      .string()
      .min(1, "Promotion name is required")
      .max(70, "Promotion name cannot be more than 70 character"),
    description: z.string().optional(),
    discount_type: z.enum(
      ["PERCENTAGE", "FIX_VALUE"],
      "Discount type is required"
    ),
    discount_value: z.number().min(0, "Discount value is required"),
    validity: z.object({
      start_date: z.iso.date().optional(),
      end_date: z.iso.date().optional(),
    }),
    unit_ids: z.array(z.number()).optional(),
    package_ids: z.array(z.number()).optional(),
  })
  .refine(
    (data) => {
      // Jika validity, start_date, dan end_date tersedia, cek urutannya
      if (data.validity && data.validity.start_date && data.validity.end_date) {
        // Pastikan start_date dan end_date bertipe string sebelum membuat objek Date
        const start =
          typeof data.validity.start_date === "string"
            ? new Date(data.validity.start_date)
            : null;
        const end =
          typeof data.validity.end_date === "string"
            ? new Date(data.validity.end_date)
            : null;

        // Jika salah satu null, anggap valid (tidak perlu validasi urutan tanggal)
        if (!start || !end) return true;

        return start <= end;
      }
      // Jika salah satu tidak ada, tidak perlu validasi urutan tanggal
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["validity.start_date", "validity.end_date"],
    }
  );
