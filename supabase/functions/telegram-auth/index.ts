import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function hex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function telegramSecretKey(botToken: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(botToken))
  return new Uint8Array(sig)
}

async function telegramDataHash(secretKey: Uint8Array, dataCheckString: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    secretKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataCheckString))
  return hex(new Uint8Array(sig))
}

function buildDataCheckString(initData: string): { dataCheckString: string; hash: string } {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) throw new Error('missing_hash')
  params.delete('hash')
  const pairs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n')
  return { dataCheckString, hash }
}

async function verifyTelegramInitData(initData: string, botToken: string): Promise<Record<string, string>> {
  const { dataCheckString, hash } = buildDataCheckString(initData)
  const secretKey = await telegramSecretKey(botToken)
  const calculated = await telegramDataHash(secretKey, dataCheckString)
  if (calculated !== hash) throw new Error('invalid_hash')

  const params = new URLSearchParams(initData)
  const authDate = params.get('auth_date')
  if (!authDate) throw new Error('missing_auth_date')
  const ageSec = Math.floor(Date.now() / 1000) - Number.parseInt(authDate, 10)
  if (Number.isNaN(ageSec) || ageSec > 86400) throw new Error('stale_auth')

  const out: Record<string, string> = {}
  for (const [k, v] of params.entries()) {
    if (k !== 'hash') out[k] = v
  }
  return out
}

function tgEmail(telegramUserId: number): string {
  return `tg_${telegramUserId}@tg.nearbynow.app`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!botToken || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'server_misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json()) as { initData?: string }
    const initData = body.initData
    if (!initData?.length) {
      return new Response(JSON.stringify({ error: 'missing_init_data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const fields = await verifyTelegramInitData(initData, botToken)
    const userJson = fields.user
    if (!userJson) {
      return new Response(JSON.stringify({ error: 'missing_user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tgUser = JSON.parse(userJson) as {
      id: number
      first_name?: string
      last_name?: string
      username?: string
      photo_url?: string
    }
    const telegramUserId = tgUser.id
    const email = tgEmail(telegramUserId)

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('telegram_user_id', telegramUserId)
      .maybeSingle()

    let userId: string

    if (existingProfile?.id) {
      userId = existingProfile.id
    } else {
      const password = crypto.randomUUID()
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          telegram_user_id: telegramUserId,
          full_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
        },
      })
      if (createErr || !created.user) {
        return new Response(
          JSON.stringify({ error: 'create_user_failed', detail: createErr?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
      userId = created.user.id

      const { error: insErr } = await admin.from('profiles').insert({
        id: userId,
        telegram_user_id: telegramUserId,
        first_name: tgUser.first_name ?? null,
        username: tgUser.username ?? null,
        avatar_url: tgUser.photo_url ?? null,
      })
      if (insErr) {
        return new Response(JSON.stringify({ error: 'profile_insert_failed', detail: insErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const newPassword = crypto.randomUUID() + crypto.randomUUID()
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })
    if (updErr) {
      return new Response(JSON.stringify({ error: 'password_rotate_failed', detail: updErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await admin
      .from('profiles')
      .update({
        first_name: tgUser.first_name ?? null,
        username: tgUser.username ?? null,
        avatar_url: tgUser.photo_url ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    return new Response(JSON.stringify({ email, password: newPassword }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return new Response(JSON.stringify({ error: 'telegram_auth_failed', detail: msg }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
