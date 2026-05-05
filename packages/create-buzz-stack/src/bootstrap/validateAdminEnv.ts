export function validateAdminEnv(contents: string): void {
  if (!contents.includes("NEXT_PUBLIC_SUPABASE_URL=")) {
    throw new Error("apps/admin/.env.local is missing NEXT_PUBLIC_SUPABASE_URL");
  }
}
