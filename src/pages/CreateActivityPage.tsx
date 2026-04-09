import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_LABEL } from '@/lib/labels'
import { supabase } from '@/lib/supabase'
import type { ActivityCategory, PreferredResponderGender } from '@/types/gender'
import { useUserStore } from '@/store/useUserStore'

const CATEGORIES: ActivityCategory[] = ['coffee', 'walk', 'sport', 'work_together']
const PREFERRED: PreferredResponderGender[] = ['male', 'female', 'non_binary', 'any']

function defaultValidUntilLocal(): string {
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CreateActivityPage() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const [category, setCategory] = useState<ActivityCategory>('coffee')
  const [title, setTitle] = useState('')
  const [validUntil, setValidUntil] = useState(defaultValidUntilLocal)
  const [preferred, setPreferred] = useState<PreferredResponderGender>('any')
  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(99)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!profile?.latitude || !profile?.longitude) return null

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setError(null)
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!validUntil) {
      setError('Choose a valid-until time.')
      return
    }
    const until = new Date(validUntil)
    if (until.getTime() <= Date.now()) {
      setError('Valid until must be in the future.')
      return
    }
    if (minAge > maxAge) {
      setError('Min age cannot be greater than max age.')
      return
    }

    setSaving(true)
    const { error: insErr } = await supabase.from('activities').insert({
      creator_id: profile.id,
      category,
      title: title.trim(),
      valid_until: until.toISOString(),
      preferred_responder_gender: preferred,
      min_age: minAge,
      max_age: maxAge,
      latitude: profile.latitude,
      longitude: profile.longitude,
      is_active: true,
    })
    setSaving(false)
    if (insErr) {
      setError(insErr.message)
      return
    }
    navigate('/', { replace: false })
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Create activity</h1>
      <form onSubmit={(e) => void handlePublish(e)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--tg-theme-hint-color,#666)]">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
            className="rounded-xl border border-[var(--tg-theme-secondary-bg-color,#ccc)] bg-[var(--tg-theme-bg-color,#fff)] px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--tg-theme-hint-color,#666)]">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="e.g. Morning espresso"
            className="rounded-xl border border-[var(--tg-theme-secondary-bg-color,#ccc)] px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--tg-theme-hint-color,#666)]">Valid until</span>
          <input
            type="datetime-local"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="rounded-xl border border-[var(--tg-theme-secondary-bg-color,#ccc)] px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--tg-theme-hint-color,#666)]">Preferred responder gender</span>
          <select
            value={preferred}
            onChange={(e) => setPreferred(e.target.value as PreferredResponderGender)}
            className="rounded-xl border border-[var(--tg-theme-secondary-bg-color,#ccc)] bg-[var(--tg-theme-bg-color,#fff)] px-3 py-2"
          >
            {PREFERRED.map((p) => (
              <option key={p} value={p}>
                {p === 'any' ? 'Any' : p === 'non_binary' ? 'Non-binary' : p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--tg-theme-hint-color,#666)]">Min age</span>
            <input
              type="number"
              min={13}
              max={120}
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value))}
              className="rounded-xl border border-[var(--tg-theme-secondary-bg-color,#ccc)] px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--tg-theme-hint-color,#666)]">Max age</span>
            <input
              type="number"
              min={13}
              max={120}
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className="rounded-xl border border-[var(--tg-theme-secondary-bg-color,#ccc)] px-3 py-2"
            />
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-xl bg-[var(--tg-theme-button-color,#2481cc)] py-3.5 text-sm font-semibold text-[var(--tg-theme-button-text-color,#fff)] disabled:opacity-50"
        >
          {saving ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
  )
}
