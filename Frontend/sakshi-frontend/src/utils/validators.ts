import { z } from "zod";

export const emailSchema    = z.string().min(1, "Email is required").email("Invalid email address");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
export const phoneSchema    = z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number");
export const otpSchema      = z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric");
export const nameSchema     = z.string().min(2, "Name must be at least 2 characters").max(100);
export const requiredString = z.string().min(1, "This field is required");

export const loginSchema = z.object({
  email:    emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name:            nameSchema,
  email:           emailSchema,
  password:        passwordSchema,
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path:    ["confirmPassword"],
});

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export function isValidEmail(v: string)  { return emailSchema.safeParse(v).success; }
export function isValidPhone(v: string)  { return phoneSchema.safeParse(v).success; }
