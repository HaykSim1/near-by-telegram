import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { ActivityWithCreator } from '@/types/activity'
import type { Gender } from '@/types/gender'

type FeedState = {
  items: ActivityWithCreator[]
  filterCreatorGender: Gender
  loading: boolean
  realtimeActive: boolean
  setFilterCreatorGender: (g: Gender) => void
  setItems: (items: ActivityWithCreator[]) => void
  fetchFeed: () => Promise<void>
  upsertItem: (row: ActivityWithCreator) => void
  removeItem: (id: string) => void
  startRealtime: () => void
  stopRealtime: () => void
}

const channelId = 'activities-feed-v1'
let feedRealtimeChannel: RealtimeChannel | null = null

async function fetchActivityWithCreator(id: string): Promise<ActivityWithCreator | null> {
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
  if (error || !data) return null
  return data as ActivityWithCreator
}

function handlePayload(
  payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>,
  get: () => FeedState,
) {
  const event = payload.eventType

  if (event === 'DELETE') {
    const oldRow = payload.old as { id?: string } | undefined
    if (oldRow?.id) get().removeItem(oldRow.id)
    return
  }

  const row = payload.new as { id?: string } | undefined
  if (!row?.id) return

  void fetchActivityWithCreator(row.id).then((full) => {
    if (!full) {
      get().removeItem(row.id!)
      return
    }
    get().upsertItem(full)
  })
}

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  filterCreatorGender: 'male',
  loading: false,
  realtimeActive: false,

  setFilterCreatorGender: (g) => set({ filterCreatorGender: g }),

  setItems: (items) => set({ items }),

  fetchFeed: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('activities')
      .select(
        `
        *,
        creator:profiles (id, first_name, username, avatar_url, gender)
      `,
      )
      .order('created_at', { ascending: false })
    set({ loading: false })
    if (error) {
      console.error(error)
      set({ items: [] })
      return
    }
    set({ items: (data as ActivityWithCreator[]) ?? [] })
  },

  upsertItem: (row) =>
    set((s) => {
      const idx = s.items.findIndex((i) => i.id === row.id)
      if (idx === -1) return { items: [row, ...s.items] }
      const next = [...s.items]
      next[idx] = row
      return { items: next }
    }),

  removeItem: (id) =>
    set((s) => ({
      items: s.items.filter((i) => i.id !== id),
    })),

  startRealtime: () => {
    if (feedRealtimeChannel) return

    feedRealtimeChannel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload) => handlePayload(payload, get),
      )
      .subscribe()

    set({ realtimeActive: true })
  },

  stopRealtime: () => {
    if (feedRealtimeChannel) {
      void supabase.removeChannel(feedRealtimeChannel)
      feedRealtimeChannel = null
    }
    set({ realtimeActive: false })
  },
}))

export function selectFilteredFeed(items: ActivityWithCreator[], filterCreatorGender: Gender): ActivityWithCreator[] {
  return items.filter((a) => a.creator?.gender === filterCreatorGender)
}
