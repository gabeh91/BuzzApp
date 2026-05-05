import { logger } from "../utils/logger.js";

export async function configurePush(): Promise<void> {
  logger.info("Push notifications remain mocked locally until a provider is configured.");
}
