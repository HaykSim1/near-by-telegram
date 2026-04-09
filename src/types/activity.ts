import type { ActivityCategory, PreferredResponderGender } from './gender'
import type { Profile } from './profile'

export type ActivityRow = {
  id: string
  creator_id: string
  category: ActivityCategory
  title: string
  valid_until: string
  preferred_responder_gender: PreferredResponderGender
  min_age: number
  max_age: number
  latitude: number
  longitude: number
  is_active: boolean
  created_at: string
}

export type ActivityWithCreator = ActivityRow & {
  creator: Pick<Profile, 'id' | 'first_name' | 'username' | 'avatar_url' | 'gender'>
}
