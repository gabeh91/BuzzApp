import path from "node:path";

export function isCreateBuzzStackInvocation(
  invocationPath: string | undefined,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (env.BUZZ_STACK_CREATE_ALIAS === "true") {
    return true;
  }

  const invokedName = path.basename(invocationPath ?? "");
  return invokedName === "create-buzz-stack" || invokedName === "create-buzz-stack.js";
}
