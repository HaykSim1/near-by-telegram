import type { Gender } from './gender'

export type Profile = {
  id: string
  telegram_user_id: number
  first_name: string | null
  username: string | null
  avatar_url: string | null
  gender: Gender | null
  age: number | null
  latitude: number | null
  longitude: number | null
  updated_at: string
}
