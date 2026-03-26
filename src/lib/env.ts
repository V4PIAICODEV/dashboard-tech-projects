/**
 * Runtime environment access.
 *
 * In development: Vite injects import.meta.env.VITE_* at build time.
 * In production (Docker/nginx): docker-entrypoint.sh writes env.js which
 * sets window.__ENV__ at runtime, so EasyPanel "Environment Variables" work.
 */

declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

function getEnv(key: string): string {
  // Runtime (production) takes precedence
  if (typeof window !== "undefined" && window.__ENV__?.[key]) {
    return window.__ENV__[key];
  }
  // Build-time fallback (development)
  return (import.meta.env[key] as string) ?? "";
}

export const ENV = {
  VITE_WEBHOOK_GRUPO1: getEnv("VITE_WEBHOOK_GRUPO1"),
  VITE_WEBHOOK_GRUPO2: getEnv("VITE_WEBHOOK_GRUPO2"),
  VITE_WEBHOOK_GRUPO3: getEnv("VITE_WEBHOOK_GRUPO3"),
  VITE_WEBHOOK_GRUPO4: getEnv("VITE_WEBHOOK_GRUPO4"),
  VITE_AUTH_PASSWORD: getEnv("VITE_AUTH_PASSWORD"),
} as const;
