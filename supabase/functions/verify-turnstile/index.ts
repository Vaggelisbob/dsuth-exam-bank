// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper για Supabase REST API call
async function logAttempt(ip: string) {
  const now = new Date().toISOString();
  // @ts-ignore
  await fetch(`${Deno.env.get('RL_SUPABASE_URL')}/rest/v1/rate_limits`, {
    method: 'POST',
    headers: {
      // @ts-ignore
      'apikey': Deno.env.get('RL_SUPABASE_SERVICE_ROLE_KEY') || '',
      // @ts-ignore
      'Authorization': `Bearer ${Deno.env.get('RL_SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ ip, timestamp: now })
  });
}

async function getAttempts(ip: string) {
  const since = new Date(Date.now() - 60 * 1000).toISOString();
  // @ts-ignore
  const res = await fetch(`${Deno.env.get('RL_SUPABASE_URL')}/rest/v1/rate_limits?ip=eq.${ip}&timestamp=gte.${since}`, {
    headers: {
      // @ts-ignore
      'apikey': Deno.env.get('RL_SUPABASE_SERVICE_ROLE_KEY') || '',
      // @ts-ignore
      'Authorization': `Bearer ${Deno.env.get('RL_SUPABASE_SERVICE_ROLE_KEY')}`,
    }
  });
  const data = await res.json();
  return data.length;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  const attempts = await getAttempts(ip);
  if (attempts >= 5) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait and try again.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  await logAttempt(ip);

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Cloudflare Turnstile verification endpoint
    const formData = new FormData()
    // @ts-ignore
    formData.append('secret', Deno.env.get('TURNSTILE_SECRET_KEY') || '')
    formData.append('response', token)

    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const verificationResult = await verificationResponse.json()

    if (verificationResult.success) {
      return new Response(
        JSON.stringify({ success: true, message: 'Token verified successfully' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token verification failed',
          details: verificationResult['error-codes'] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 