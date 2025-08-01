import z from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2).max(50).nonempty(),
    email: z.email().nonempty(),
    password: z.string().min(8).max(50).nonempty(),
    confirm_password: z.string().min(8).max(50).nonempty(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password Confirmation and Password must be same",
    path: ["confirm_password"],
  });

export const loginSchema = z.object({
  email: z.email().nonempty(),
  password: z.string().nonempty(),
});
