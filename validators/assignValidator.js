import { z } from "zod";

export const assignLeadSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
});
