/* Sensay environment configuration and shared headers helper */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Environment variable "${name}" is required but not set`);
  }
  return value;
}

export const SENSAY_API_KEY = requireEnv("SENSAY_API_KEY");
export const SENSAY_ORG_ID = requireEnv("SENSAY_ORG_ID");
export const SENSAY_API_VERSION = requireEnv("SENSAY_API_VERSION");

export function sensayHeaders(additional?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
    "X-API-Version": SENSAY_API_VERSION,
    ...additional,
  };
}