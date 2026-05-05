import { z } from "zod";

export const interestActivationSchema = z.object({
  interestId: z.string().uuid(),
  cityId: z.string().uuid().optional()
});
