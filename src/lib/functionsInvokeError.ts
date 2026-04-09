import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'

/** User-safe detail for Edge Function invoke failures (no secrets). */
export function formatFunctionsInvokeError(error: unknown): string {
  if (error instanceof FunctionsFetchError) {
    const c = error.context
    if (c instanceof Error) return `${error.message}: ${c.message}`
    if (typeof c === 'string' && c.length > 0) return `${error.message}: ${c}`
    return `${error.message} (network or CORS — check URL, deploy, and Mini App network access)`
  }
  if (error instanceof FunctionsRelayError) {
    return `${error.message} (Supabase relay — retry or check status.supabase.com)`
  }
  if (error instanceof FunctionsHttpError) {
    const res = error.context as Response | undefined
    const status = res?.status
    return `${error.message}${status != null ? ` (HTTP ${status})` : ''}`
  }
  if (error instanceof Error) return error.message
  return 'Unknown error calling Edge Function'
}
