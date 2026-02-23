// Supabase Edge Function: android-proxy
// General-purpose proxy for Android devices where custom HTTP headers fail.
//
// On affected devices, both XHR and native fetch fail when ANY custom header
// is present (apikey, Authorization, etc). This function accepts headerless
// POST requests with the actual request details in the body, forwards them
// to Supabase with proper headers, and returns the response.
//
// Deploy with: supabase functions deploy android-proxy --no-verify-jwt

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Step 1: Parse the request body
  let parsed: { url?: string; method?: string; headers?: Record<string, string>; body?: string };
  try {
    const rawBody = await req.text();
    if (!rawBody) {
      return new Response(
        JSON.stringify({ error: "Empty request body" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      );
    }
    parsed = JSON.parse(rawBody);
  } catch (parseErr) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body", detail: String(parseErr) }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const { url, method, headers, body } = parsed;

  if (!url) {
    return new Response(
      JSON.stringify({ error: "url is required in body" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  // Step 2: Forward the request with all original headers (server-side, no issues)
  try {
    const response = await fetch(url, {
      method: method || "GET",
      headers: headers || {},
      body: body || undefined,
    });

    const responseBody = await response.text();

    // Forward important response headers
    const responseHeaders: Record<string, string> = {
      ...CORS_HEADERS,
    };

    const contentType = response.headers.get("Content-Type");
    if (contentType) responseHeaders["Content-Type"] = contentType;

    // PostgREST uses Content-Range for pagination
    const contentRange = response.headers.get("Content-Range");
    if (contentRange) responseHeaders["Content-Range"] = contentRange;

    // Preference-Applied for PostgREST count headers
    const prefApplied = response.headers.get("Preference-Applied");
    if (prefApplied) responseHeaders["Preference-Applied"] = prefApplied;

    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (fetchErr) {
    return new Response(
      JSON.stringify({
        error: "Proxy fetch failed",
        detail: String(fetchErr),
        target_url: url.substring(0, 80),
      }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }
});
