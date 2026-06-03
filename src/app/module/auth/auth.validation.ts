import { email, z } from "zod";

const registerValidationSchema = z.object({
  firstName: z.string({ message: "first name is required" }).min(2).max(50),
  lastName: z.string().nullable().optional(),
  password: z.string({ message: "password is required" }).min(6).max(66),
  email: z.string({ message: "email is required" }).email().max(322),
});

const loginValidationSchema = z.object({
  email: z.string({ message: "email is required" }).email().max(322),
  password: z.string({ message: "password is required" }).min(6).max(66),
});

export { registerValidationSchema, loginValidationSchema };
