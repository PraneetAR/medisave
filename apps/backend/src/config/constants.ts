export const CONSTANTS = {
  SALT_ROUNDS: 12,
  PRICE_CACHE_TTL_HOURS: 6,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  API_PREFIX: "/api",
} as const;