import { useState } from 'react'
import { GENDER_LABEL } from '@/lib/labels'
import type { Gender } from '@/types/gender'
import { useUserStore } from '@/store/useUserStore'

const GENDERS: Gender[] = ['male', 'female', 'non_binary']

export function ProfilePage() {
  const profile = useUserStore((s) => s.profile)
  const patchProfile = useUserStore((s) => s.patchProfile)
  const fetchProfile = useUserStore((s) => s.fetchProfile)
  const [gender, setGender] = useState<Gender | null>(null)
  const [age, setAge] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const genderValue = gender ?? profile?.gender ?? 'male'
  const ageValue = age ?? profile?.age ?? 25

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setSaving(true)
    const { error } = await patchProfile({ gender: genderValue, age: ageValue })
    setSaving(false)
    if (error) setMessage(error)
    else {
      setMessage('Saved')
      await fetchProfile()
    }
  }

  if (!profile) {
    return <p className="text-sm">Loading…</p>
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Profile</h1>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[var(--tg-theme-secondary-bg-color,#e8e8e8)] bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] p-4">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tg-theme-button-color,#2481cc)] text-lg font-semibold text-[var(--tg-theme-button-text-color,#fff)]">
            {(profile.first_name || profile.username || '?').slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{profile.first_name || '—'}</p>
          <p className="truncate text-sm text-[var(--tg-theme-hint-color,#666)]">
            @{profile.username || '—'}
          </p>
          <p className="text-xs text-[var(--tg-theme-hint-color,#888)]">From Telegram (read-only)</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSave(e)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--tg-theme-hint-color,#666)]">Gender</span>
          <select
            value={genderValue}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="rounded-xl border border-[var(--tg-theme-secondary-bg-color,#ccc)] bg-[var(--tg-theme-bg-color,#fff)] px-3 py-2"
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABEL[g]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--tg-theme-hint-color,#666)]">Age</span>
          <input
            type="number"
            min={13}
            max={120}
            value={ageValue}
            onChange={(e) => setAge(Number(e.target.value))}
            className="rounded-xl border border-[var(--tg-theme-secondary-bg-color,#ccc)] px-3 py-2"
          />
        </label>

        {message ? <p className="text-sm text-[var(--tg-theme-hint-color,#666)]">{message}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[var(--tg-theme-button-color,#2481cc)] py-3.5 text-sm font-semibold text-[var(--tg-theme-button-text-color,#fff)] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
