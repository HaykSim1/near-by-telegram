import { devDebug } from '@/lib/devDebug'
import { supabase } from '@/lib/supabase'
import { getTelegramInitData } from '@/lib/telegram'

export type TelegramAuthResult = { ok: true } | { ok: false; message: string }

export async function signInWithTelegram(): Promise<TelegramAuthResult> {
  const bypass = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'
  const devEmail = import.meta.env.VITE_DEV_EMAIL as string | undefined
  const devPassword = import.meta.env.VITE_DEV_PASSWORD as string | undefined

  if (bypass && devEmail && devPassword) {
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

  if (bypass) {
    devDebug('auth', {
      path: 'dev_bypass_skipped',
      reason: !devEmail ? 'missing_VITE_DEV_EMAIL' : 'missing_VITE_DEV_PASSWORD',
    })
  }

  const initData = getTelegramInitData()
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
    devDebug('auth', { path: 'telegram', edgeError: error.message })
    return { ok: false, message: error.message }
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
