import { z } from "zod";

export const createLeadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  revenue: z
    .number({ invalid_type_error: "Revenue must be a number" })
    .positive("Revenue must be greater than 0"),
});
