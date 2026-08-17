import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z.string().email().max(200),
  role: z.enum(["ADMIN", "OPERATOR"]),
});

export const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "OPERATOR"]).optional(),
  active: z.boolean().optional(),
});

export const updateConfigSchema = z.object({
  value: z.string().max(2000),
});
