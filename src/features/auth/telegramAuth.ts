import { supabase } from '@/lib/supabase'
import { getTelegramInitData } from '@/lib/telegram'

export type TelegramAuthResult = { ok: true } | { ok: false; message: string }

export async function signInWithTelegram(): Promise<TelegramAuthResult> {
  const bypass = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'
  const devEmail = import.meta.env.VITE_DEV_EMAIL as string | undefined
  const devPassword = import.meta.env.VITE_DEV_PASSWORD as string | undefined

  if (bypass && devEmail && devPassword) {
    const { error } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  }

  const initData = getTelegramInitData()
  if (!initData) {
    return { ok: false, message: 'Open inside Telegram to sign in.' }
  }

  const { data, error } = await supabase.functions.invoke<{ email?: string; password?: string; error?: string; detail?: string }>(
    'telegram-auth',
    { body: { initData } },
  )

  if (error) {
    return { ok: false, message: error.message }
  }
  if (!data?.email || !data?.password) {
    const msg = data?.detail ?? data?.error ?? 'Telegram auth failed'
    return { ok: false, message: msg }
  }

  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
  if (signErr) return { ok: false, message: signErr.message }
  return { ok: true }
}
