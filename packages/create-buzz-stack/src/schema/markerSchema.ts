import { z } from "zod";

export const markerSchema = z.object({
  project: z.string(),
  stackVersion: z.string(),
  createdBy: z.literal("create-buzz-stack"),
  createdAt: z.string(),
  repoInitialized: z.boolean(),
  ciProvider: z.string().nullable(),
  hostingProvider: z.string().nullable(),
  components: z.record(
    z.string(),
    z.object({
      enabled: z.boolean(),
      configured: z.boolean()
    }).passthrough()
  )
});

export type BuzzStackMarker = z.infer<typeof markerSchema>;
