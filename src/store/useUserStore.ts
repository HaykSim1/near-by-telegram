import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/profile'

type UserState = {
  profile: Profile | null
  loading: boolean
  setProfile: (p: Profile | null) => void
  fetchProfile: () => Promise<void>
  patchProfile: (partial: Partial<Profile>) => Promise<{ error?: string }>
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  loading: false,
  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      set({ profile: null })
      return
    }
    set({ loading: true })
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    set({ loading: false })
    if (error || !data) {
      set({ profile: null })
      return
    }
    set({ profile: data as Profile })
  },

  patchProfile: async (partial) => {
    const p = get().profile
    if (!p) return { error: 'no_profile' }
    const { error } = await supabase
      .from('profiles')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('id', p.id)
    if (error) return { error: error.message }
    set({ profile: { ...p, ...partial } as Profile })
    return {}
  },
}))
