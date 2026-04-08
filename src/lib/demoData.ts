/**
 * Demo activities/users are for local development and optional staging.
 * Production builds default to empty data unless VITE_USE_DEMO_DATA=true.
 */
export function isDemoDataEnabled(): boolean {
  const v = import.meta.env.VITE_USE_DEMO_DATA;
  if (v === "true") return true;
  if (v === "false") return false;
  return import.meta.env.DEV;
}
