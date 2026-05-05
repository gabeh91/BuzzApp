import { logger } from "../utils/logger.js";

export async function configurePayments(): Promise<void> {
  logger.info("Payments support is placeholder-only until live Stripe secrets are configured.");
}
