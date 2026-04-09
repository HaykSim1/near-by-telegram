import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ActivityDetailsPage } from '@/pages/ActivityDetailsPage'
import { CreateActivityPage } from '@/pages/CreateActivityPage'
import { FeedPage } from '@/pages/FeedPage'
import { MyActivitiesPage } from '@/pages/MyActivitiesPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/useUserStore'
import { useEffect, useState } from 'react'

function RequireSession() {
  const [session, setSession] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(!!s)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === null) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-[var(--tg-theme-hint-color,#888)]">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function RequireLocation() {
  const profile = useUserStore((s) => s.profile)
  const location = useLocation()

  if (!profile) {
    return (
      <div className="p-4">
        <p className="text-sm">Loading profile…</p>
      </div>
    )
  }

  if (profile.latitude == null || profile.longitude == null) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<RequireSession />}>
        <Route element={<AppShell />}>
          <Route element={<RequireLocation />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/create" element={<CreateActivityPage />} />
            <Route path="/activity/:id" element={<ActivityDetailsPage />} />
          </Route>
          <Route path="/my-activities" element={<MyActivitiesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
