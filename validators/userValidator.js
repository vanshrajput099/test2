import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  email: z.string().email("Invalid email").trim().toLowerCase(),
  role: z.enum(["AGENT", "MANAGER"]).default("AGENT"),
  managerId: z
    .string()
    .cuid("Invalid manager ID")
    .optional()
    .nullable()
    .or(z.literal("")),
});
