import { logger } from "../utils/logger.js";

export async function configureAi(): Promise<void> {
  logger.info("AI stays in mock mode locally. Configure provider keys in server-side env only.");
}
