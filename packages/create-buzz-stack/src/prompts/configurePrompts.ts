export async function selectConfigureTarget(target?: string): Promise<string> {
  return target ?? "railway";
}
