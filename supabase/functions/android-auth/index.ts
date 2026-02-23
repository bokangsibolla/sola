// Supabase Edge Function: android-auth
// Proxy for Android Google Sign-In token exchange.
//
// Android New Architecture has a bug where native fetch fails for ANY request
// with custom headers. This function runs server-side (Deno) where networking
// works perfectly, accepting headerless requests from the Android client and
// proxying them to Supabase Auth with proper headers.
//
// Deploy with: supabase functions deploy android-auth --no-verify-jwt

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    // Accept token from body or query params (query params for zero-header requests)
    let idToken: string | null = null;
    let provider = "google";

    const url = new URL(req.url);
    const queryToken = url.searchParams.get("id_token");
    const queryProvider = url.searchParams.get("provider");

    if (queryToken) {
      idToken = queryToken;
      if (queryProvider) provider = queryProvider;
    } else {
      try {
        const body = await req.json();
        idToken = body.id_token || body.idToken;
        if (body.provider) provider = body.provider;
      } catch {
        // Body parse failed — check if token was in query
      }
    }

    if (!idToken) {
      return new Response(
        JSON.stringify({ error: "id_token is required (body or query param)" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        },
      );
    }

    // Proxy to Supabase Auth — server-side, headers work perfectly
    const authResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=id_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          id_token: idToken,
          provider,
          gotrue_meta_security: {},
        }),
      },
    );

    const authData = await authResponse.json();

    // If auth succeeded, also fetch profile onboarding status so the client
    // doesn't need to make a separate (header-requiring) request.
    let profile = null;
    if (authResponse.ok && authData.access_token && authData.user?.id) {
      try {
        const profileResp = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?select=id,onboarding_completed_at&id=eq.${authData.user.id}`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${authData.access_token}`,
            },
          },
        );
        if (profileResp.ok) {
          const profiles = await profileResp.json();
          profile = profiles.length > 0 ? profiles[0] : null;
        }
      } catch {
        // Profile check is best-effort — client will handle missing data
      }
    }

    return new Response(JSON.stringify({ ...authData, profile }), {
      status: authResponse.status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Edge function error", detail: String(err) }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }
});
