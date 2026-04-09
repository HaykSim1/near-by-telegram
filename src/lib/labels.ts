import type { ActivityCategory, Gender, PreferredResponderGender } from '@/types/gender'

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  coffee: 'Coffee',
  walk: 'Walk',
  sport: 'Sport',
  work_together: 'Work together',
}

export const GENDER_LABEL: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
}

export const PREFERRED_LABEL: Record<PreferredResponderGender, string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  any: 'Any',
}
