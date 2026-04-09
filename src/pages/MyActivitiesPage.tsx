import { useEffect, useMemo, useState } from 'react'
import { formatValidUntil } from '@/lib/format'
import { CATEGORY_LABEL } from '@/lib/labels'
import { supabase } from '@/lib/supabase'
import type { ActivityRow } from '@/types/activity'
import { useUserStore } from '@/store/useUserStore'

export function MyActivitiesPage() {
  const profile = useUserStore((s) => s.profile)
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    let cancelled = false
    void (async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (!error && data) setRows(data as ActivityRow[])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [profile?.id])

  const { active, expired } = useMemo(() => {
    // Wall clock: partition active vs expired for display lists.
    // eslint-disable-next-line react-hooks/purity -- intentional time-based split
    const now = Date.now()
    const active: ActivityRow[] = []
    const expired: ActivityRow[] = []
    for (const r of rows) {
      const stillValid = new Date(r.valid_until).getTime() > now
      if (r.is_active && stillValid) active.push(r)
      else expired.push(r)
    }
    return { active, expired }
  }, [rows])

  if (!profile) {
    return <p className="text-sm">Loading…</p>
  }

  function statusLine(r: ActivityRow): string {
    // eslint-disable-next-line react-hooks/purity -- status depends on current time
    const now = Date.now()
    const stillValid = new Date(r.valid_until).getTime() > now
    if (!r.is_active) return 'Inactive'
    if (!stillValid) return 'Expired'
    return 'Active'
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">My activities</h1>
      {loading ? <p className="text-sm text-[var(--tg-theme-hint-color,#888)]">Loading…</p> : null}

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--tg-theme-hint-color,#888)]">
          Active
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-[var(--tg-theme-hint-color,#888)]">No active activities.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-[var(--tg-theme-secondary-bg-color,#e8e8e8)] bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] p-4"
              >
                <p className="text-xs text-[var(--tg-theme-hint-color,#666)]">{CATEGORY_LABEL[r.category]}</p>
                <p className="font-medium">{r.title}</p>
                <p className="mt-1 text-xs text-[var(--tg-theme-hint-color,#888)]">
                  Until {formatValidUntil(r.valid_until)}
                </p>
                <p className="mt-1 text-xs text-[var(--tg-theme-hint-color,#888)]">
                  Created {formatValidUntil(r.created_at)}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--tg-theme-link-color,#2481cc)]">{statusLine(r)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--tg-theme-hint-color,#888)]">
          Expired
        </h2>
        {expired.length === 0 ? (
          <p className="text-sm text-[var(--tg-theme-hint-color,#888)]">No expired activities.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {expired.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-[var(--tg-theme-secondary-bg-color,#e8e8e8)] bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] p-4 opacity-80"
              >
                <p className="text-xs text-[var(--tg-theme-hint-color,#666)]">{CATEGORY_LABEL[r.category]}</p>
                <p className="font-medium">{r.title}</p>
                <p className="mt-1 text-xs text-[var(--tg-theme-hint-color,#888)]">
                  Until {formatValidUntil(r.valid_until)}
                </p>
                <p className="mt-1 text-xs text-[var(--tg-theme-hint-color,#888)]">
                  Created {formatValidUntil(r.created_at)}
                </p>
                <p className="mt-1 text-xs font-medium">{statusLine(r)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
