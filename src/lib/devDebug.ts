/** Console logging for local debugging; never pass secrets. */
export function devDebug(scope: string, data: Record<string, unknown>): void {
  if (!import.meta.env.DEV) return
  if (import.meta.env.VITE_DEV_DEBUG !== 'true') return
  console.info(`[nearby:${scope}]`, data)
}
