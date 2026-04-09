import { useEffect, useState, type ReactNode } from 'react'
import { signInWithTelegram } from '@/features/auth/telegramAuth'
import { devDebug } from '@/lib/devDebug'
import { supabase } from '@/lib/supabase'
import { initTelegramWebApp } from '@/lib/telegram'
import { useUserStore } from '@/store/useUserStore'

export function AppProviders({ children }: { children: ReactNode }) {
  const [bootReady, setBootReady] = useState(false)
  const fetchProfile = useUserStore((s) => s.fetchProfile)

  useEffect(() => {
    initTelegramWebApp()
    let cancelled = false

    async function boot() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      devDebug('boot', { hadSession: !!session })
      if (session) {
        await fetchProfile()
        if (!cancelled) setBootReady(true)
        return
      }

      const result = await signInWithTelegram()
      devDebug('boot', { signInOk: result.ok, signInMessage: result.ok ? undefined : result.message })
      if (!cancelled && result.ok) {
        await fetchProfile()
      }
      if (!cancelled) setBootReady(true)
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [fetchProfile])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void fetchProfile()
      else useUserStore.getState().setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  if (!bootReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)]">
        <p className="text-sm text-[var(--tg-theme-hint-color,#888)]">Loading…</p>
      </div>
    )
  }

  return children
}
