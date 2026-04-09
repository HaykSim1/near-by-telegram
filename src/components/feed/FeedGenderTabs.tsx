import { GENDER_LABEL } from '@/lib/labels'
import type { Gender } from '@/types/gender'

const TABS: Gender[] = ['male', 'female', 'non_binary']

type Props = {
  value: Gender
  onChange: (g: Gender) => void
}

export function FeedGenderTabs({ value, onChange }: Props) {
  return (
    <div className="mb-3 flex gap-1 rounded-xl bg-[var(--tg-theme-secondary-bg-color,#eee)] p-1">
      {TABS.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            value === g
              ? 'bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)] shadow-sm'
              : 'text-[var(--tg-theme-hint-color,#666)]'
          }`}
        >
          {GENDER_LABEL[g]}
        </button>
      ))}
    </div>
  )
}
