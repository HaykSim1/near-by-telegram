import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { distanceKm } from '@/lib/geo'
import { formatDistanceKm, formatValidUntil } from '@/lib/format'
import { CATEGORY_LABEL, GENDER_LABEL, PREFERRED_LABEL } from '@/lib/labels'
import { supabase } from '@/lib/supabase'
import type { ActivityWithCreator } from '@/types/activity'
import type { Profile } from '@/types/profile'
import { useUserStore } from '@/store/useUserStore'

function ActivityDetailsLoaded({ id, profile }: { id: string; profile: Profile }) {
  const [row, setRow] = useState<ActivityWithCreator | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(
          `
          *,
          creator:profiles (id, first_name, username, avatar_url, gender)
        `,
        )
        .eq('id', id)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) setRow(null)
      else setRow(data as ActivityWithCreator)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <p className="text-sm text-[var(--tg-theme-hint-color,#888)]">Loading…</p>
  }

  if (!row) {
    return (
      <div>
        <p className="text-sm">Activity not found or no longer visible.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-[var(--tg-theme-link-color,#2481cc)]">
          Back to feed
        </Link>
      </div>
    )
  }

  const c = row.creator
  const name = c?.first_name || c?.username || 'Someone'
  const km = distanceKm(profile.latitude!, profile.longitude!, row.latitude, row.longitude)

  return (
    <div>
      <Link to="/" className="mb-4 inline-block text-sm text-[var(--tg-theme-link-color,#2481cc)]">
        ← Feed
      </Link>
      <div className="flex gap-4">
        {c?.avatar_url ? (
          <img src={c.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tg-theme-button-color,#2481cc)] text-xl font-semibold text-[var(--tg-theme-button-text-color,#fff)]">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{name}</h1>
          <p className="text-sm text-[var(--tg-theme-hint-color,#666)]">{CATEGORY_LABEL[row.category]}</p>
        </div>
      </div>
      <p className="mt-4 text-lg font-medium leading-snug">{row.title}</p>
      <ul className="mt-6 space-y-2 text-sm text-[var(--tg-theme-hint-color,#666)]">
        <li>Valid until: {formatValidUntil(row.valid_until)}</li>
        <li>Distance: {formatDistanceKm(km)}</li>
        <li>Preferred responder: {PREFERRED_LABEL[row.preferred_responder_gender]}</li>
        <li>
          Age range: {row.min_age}–{row.max_age}
        </li>
        {c?.gender ? <li>Host gender: {GENDER_LABEL[c.gender]}</li> : null}
      </ul>
    </div>
  )
}

export function ActivityDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const profile = useUserStore((s) => s.profile)

  if (!profile?.latitude || !profile?.longitude) return null

  if (!id) {
    return (
      <div>
        <p className="text-sm">Invalid activity.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-[var(--tg-theme-link-color,#2481cc)]">
          Back to feed
        </Link>
      </div>
    )
  }

  return <ActivityDetailsLoaded key={id} id={id} profile={profile} />
}
