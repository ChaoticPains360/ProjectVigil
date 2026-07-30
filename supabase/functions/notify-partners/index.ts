// Called from the client right after an urge_logs insert (see
// src/lib/urgeActions.js). Looks up the caller's ACTIVE partners
// and, respecting the caller's own partner_notify_pref, sends a
// web push to each partner's registered devices.
//
// Deploy: supabase functions deploy notify-partners
// Secrets required (supabase secrets set ...):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:you@example.com)
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are
// injected automatically by the Supabase Edge Functions runtime.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Identify the caller from their JWT (forwarded automatically by
    // supabase.functions.invoke on the client).
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userErr,
    } = await authClient.auth.getUser()
    if (userErr || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }
    const ownerId = user.id

    const { outcome } = await req.json()

    // service_role client for privileged cross-user reads (partner
    // subscriptions the owner could never read directly under RLS).
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: ownerProfile } = await admin
      .from('profiles')
      .select('display_name, partner_notify_pref')
      .eq('id', ownerId)
      .single()

    if (ownerProfile?.partner_notify_pref === 'slip_only' && outcome !== 'slip') {
      return new Response(JSON.stringify({ skipped: 'owner preference' }), {
        status: 200,
        headers: corsHeaders,
      })
    }

    const { data: links } = await admin
      .from('partner_links')
      .select('partner_id')
      .eq('owner_id', ownerId)
      .eq('status', 'active')

    const partnerIds = (links ?? []).map((l) => l.partner_id).filter(Boolean)
    if (partnerIds.length === 0) {
      return new Response(JSON.stringify({ notified: 0 }), { status: 200, headers: corsHeaders })
    }

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('*')
      .in('user_id', partnerIds)

    const name = ownerProfile?.display_name ?? 'Someone you support'
    const payload = JSON.stringify({
      title: 'Vigil',
      body: outcome === 'slip' ? `${name} logged a slip.` : `${name} logged an urge.`,
      url: '/partner-view',
    })

    let sent = 0
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        sent++
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await admin.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }

    return new Response(JSON.stringify({ notified: sent }), { status: 200, headers: corsHeaders })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
