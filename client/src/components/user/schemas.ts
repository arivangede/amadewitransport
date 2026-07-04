import z from "zod";

export const AccountSchema = z.object({
  name: z.string().min(2).max(50).nonempty(),
  email: z.email().nonempty(),
});

export const PasswordSchema = z
  .object({
    old_password: z.string().min(8).nonempty(),
    new_password: z.string().min(8).nonempty(),
    confirm_password: z.string().nonempty(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Password Confirmation and New Password must be same",
    path: ["confirm_password"],
  });
