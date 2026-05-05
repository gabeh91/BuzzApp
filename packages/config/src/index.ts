import { z } from "zod";

export const appEnvSchema = z.enum(["local", "development", "staging", "production"]);

export function isLocalEnv(value: string | undefined): boolean {
  return appEnvSchema.safeParse(value).success && value === "local";
}
