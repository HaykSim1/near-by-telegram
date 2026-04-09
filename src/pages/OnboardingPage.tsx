import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithTelegram } from '@/features/auth/telegramAuth'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/useUserStore'

export function OnboardingPage() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const patchProfile = useUserStore((s) => s.patchProfile)
  const fetchProfile = useUserStore((s) => s.fetchProfile)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    setError(null)
    setBusy(true)
    try {
      let session = (await supabase.auth.getSession()).data.session
      if (!session) {
        const auth = await signInWithTelegram()
        if (!auth.ok) {
          setError(auth.message)
          setBusy(false)
          return
        }
        await fetchProfile()
        session = (await supabase.auth.getSession()).data.session
      }

      if (!session) {
        setError('Could not sign in.')
        setBusy(false)
        return
      }

      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20_000,
        })
      })

      const { error: upErr } = await patchProfile({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
      if (upErr) {
        setError(upErr)
        setBusy(false)
        return
      }

      navigate('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Location error')
    } finally {
      setBusy(false)
    }
  }

  const hasLocation = profile?.latitude != null && profile?.longitude != null

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nearby Now</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--tg-theme-hint-color,#666)]">
          See nearby activity invites—coffee, walks, sport, co-working. Built for quick real-life meetups, not dating.
        </p>
      </div>
      {hasLocation ? (
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="rounded-xl bg-[var(--tg-theme-button-color,#2481cc)] py-3.5 text-center text-sm font-semibold text-[var(--tg-theme-button-text-color,#fff)]"
        >
          Continue to feed
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleContinue()}
          className="rounded-xl bg-[var(--tg-theme-button-color,#2481cc)] py-3.5 text-center text-sm font-semibold text-[var(--tg-theme-button-text-color,#fff)] disabled:opacity-50"
        >
          {busy ? 'Please wait…' : 'Continue · share location'}
        </button>
      )}
      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
