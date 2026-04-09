import { devDebug } from '@/lib/devDebug'
import { formatFunctionsInvokeError } from '@/lib/functionsInvokeError'
import { supabase } from '@/lib/supabase'
import { getTelegramInitData } from '@/lib/telegram'

export type TelegramAuthResult = { ok: true } | { ok: false; message: string }

async function yieldToHost(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

export async function signInWithTelegram(): Promise<TelegramAuthResult> {
  const allowDevBypass = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'
  const devEmail = import.meta.env.VITE_DEV_EMAIL as string | undefined
  const devPassword = import.meta.env.VITE_DEV_PASSWORD as string | undefined

  // #region agent log
  const w = typeof window !== 'undefined' ? (window as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp : undefined
  fetch('http://127.0.0.1:7326/ingest/b5cf4f5d-28cc-4fe5-a11b-69ab24f7f520', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '94673d' },
    body: JSON.stringify({
      sessionId: '94673d',
      runId: 'telegram-signin',
      hypothesisId: 'H1',
      location: 'telegramAuth.ts:signInWithTelegram:entry',
      message: 'auth branch env',
      data: {
        viteDev: import.meta.env.DEV,
        allowDevBypass,
        hasWindowWebApp: !!w,
        windowInitLen: w?.initData?.length ?? 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion

  if (allowDevBypass && devEmail && devPassword) {
    devDebug('auth', { path: 'dev_bypass', emailSet: true })
    const { error } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    })
    if (error) {
      devDebug('auth', { path: 'dev_bypass', ok: false, code: error.message })
      return { ok: false, message: error.message }
    }
    devDebug('auth', { path: 'dev_bypass', ok: true })
    return { ok: true }
  }

  if (import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true') {
    devDebug('auth', {
      path: 'dev_bypass_skipped',
      reason: !allowDevBypass
        ? 'prod_build_ignores_bypass'
        : !devEmail
          ? 'missing_VITE_DEV_EMAIL'
          : 'missing_VITE_DEV_PASSWORD',
    })
  }

  await yieldToHost()

  const initData = getTelegramInitData()

  // #region agent log
  fetch('http://127.0.0.1:7326/ingest/b5cf4f5d-28cc-4fe5-a11b-69ab24f7f520', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '94673d' },
    body: JSON.stringify({
      sessionId: '94673d',
      runId: 'telegram-signin',
      hypothesisId: 'H2',
      location: 'telegramAuth.ts:afterYield',
      message: 'initData snapshot',
      data: { initDataLen: initData.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion

  if (!initData) {
    devDebug('auth', { path: 'telegram', reason: 'no_initData' })
    return { ok: false, message: 'Open inside Telegram to sign in.' }
  }

  devDebug('auth', { path: 'telegram', invokingEdge: true })
  const { data, error } = await supabase.functions.invoke<{ email?: string; password?: string; error?: string; detail?: string }>(
    'telegram-auth',
    { body: { initData } },
  )

  if (error) {
    const msg = formatFunctionsInvokeError(error)
    devDebug('auth', { path: 'telegram', edgeError: msg, errorName: (error as Error).name })
    // #region agent log
    fetch('http://127.0.0.1:7326/ingest/b5cf4f5d-28cc-4fe5-a11b-69ab24f7f520', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '94673d' },
      body: JSON.stringify({
        sessionId: '94673d',
        runId: 'edge-invoke',
        hypothesisId: 'H3',
        location: 'telegramAuth.ts:invokeError',
        message: 'functions.invoke failed',
        data: {
          errorName: (error as Error).name,
          formattedLen: msg.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return { ok: false, message: msg }
  }
  if (!data?.email || !data?.password) {
    const msg = data?.detail ?? data?.error ?? 'Telegram auth failed'
    devDebug('auth', { path: 'telegram', badPayload: true })
    return { ok: false, message: msg }
  }

  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
  if (signErr) {
    devDebug('auth', { path: 'telegram', signInError: signErr.message })
    return { ok: false, message: signErr.message }
  }
  devDebug('auth', { path: 'telegram', ok: true })
  return { ok: true }
}
