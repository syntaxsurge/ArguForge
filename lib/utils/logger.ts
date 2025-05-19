/**
 * Simple centralized logger to avoid direct console calls.
 * Extend here to integrate with external logging/monitoring services.
 */
export function logError(
  message?: unknown,
  ...optionalParams: unknown[]
): void {
  // Always log errors – could be routed to Sentry, Logtail, etc.

  console.error(message, ...optionalParams);
}

export function logDebug(
  message?: unknown,
  ...optionalParams: unknown[]
): void {
  if (process.env.NODE_ENV === "development") {
    console.debug(message, ...optionalParams);
  }
}
