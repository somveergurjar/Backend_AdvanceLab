// Fail fast at boot if required config is missing, instead of crashing lazily
// on the first request that happens to touch the missing value.
const REQUIRED = ["DATABASE_URL", "JWT_KEY", "JWT_ISSUER", "JWT_AUDIENCE"] as const;

export function assertRequiredEnv(): void {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }

  const origins = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (!origins) {
    console.warn(
      "WARNING: CORS_ALLOWED_ORIGINS is not set — all cross-origin requests will be rejected by the browser."
    );
  }
}
