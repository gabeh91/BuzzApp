export function allowLocalDevBypass(appEnv: string | undefined, bypass: string | undefined): boolean {
  return appEnv === "local" && bypass === "true";
}
