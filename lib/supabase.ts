import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://bfyewxgdfkmkviajmfzp.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeWV3eGdkZmtta3ZpYWptZnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjY1ODIsImV4cCI6MjA4NTYwMjU4Mn0.qzY2p1EP5tOsi2EcHGJScodkcMKCf-KaSb3IGFD6fgM';

// ── Build-time validation ───────────────────────────────────────────────────
// Fail loudly if URL or key is empty/undefined (catches EAS misconfiguration).
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Sola] FATAL: Supabase URL or anon key is empty. Check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in eas.json or .env.',
  );
}

// ── Safe config digest for diagnostics ──────────────────────────────────────
export function getConfigDigest(): string {
  const keyPreview = supabaseAnonKey
    ? `${supabaseAnonKey.slice(0, 8)}…${supabaseAnonKey.slice(-6)}`
    : 'MISSING';
  return `url=${supabaseUrl.substring(0, 45)} key=${keyPreview}`;
}

// ── Storage adapter ─────────────────────────────────────────────────────────
// Using AsyncStorage instead of SecureStore to diagnose touch event issues
// on Android with New Architecture. SecureStore's native module calls may
// interfere with gesture handlers.
const AsyncStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

// ── Android header fix ──────────────────────────────────────────────────────
// React Native 0.81 New Architecture TurboModule networking on Android has a
// bug where requests with the non-standard `apikey` header fail instantly
// (~150ms, before leaving the device). Supabase's Kong gateway accepts the
// API key as either a header or a query parameter. On Android, we move
// `apikey` from header to query param to bypass the TurboModule bug.

/** Normalize any HeadersInit shape to a mutable Record. */
function normalizeHeaders(
  raw: HeadersInit | undefined,
): Record<string, string> {
  if (!raw) return {};
  if (raw instanceof Headers) {
    const out: Record<string, string> = {};
    raw.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  }
  if (Array.isArray(raw)) {
    const out: Record<string, string> = {};
    for (const [k, v] of raw) {
      out[k] = v;
    }
    return out;
  }
  return { ...(raw as Record<string, string>) };
}

/**
 * On Android, move the `apikey` header to a query parameter.
 * Returns { url, headers } with the apikey stripped from headers and
 * appended to the URL. No-op on non-Android platforms.
 */
function apikeyToQueryParam(
  url: string,
  headers: Record<string, string>,
): { url: string; headers: Record<string, string> } {
  if (Platform.OS !== 'android') return { url, headers };

  const apikey = headers['apikey'] || headers['Apikey'] || headers['APIKEY'];
  if (!apikey) return { url, headers };

  const cleaned = { ...headers };
  delete cleaned['apikey'];
  delete cleaned['Apikey'];
  delete cleaned['APIKEY'];

  const separator = url.includes('?') ? '&' : '?';
  return {
    url: `${url}${separator}apikey=${encodeURIComponent(apikey)}`,
    headers: cleaned,
  };
}

// ── XHR-based fetch fallback ────────────────────────────────────────────────
// On Android, React Native's native `fetch` (TurboModule in New Arch) has
// known issues with OkHttp connection pool cold starts. XMLHttpRequest uses
// a different native module code path and can succeed when fetch fails.
function xhrFetch(
  input: string | Request,
  init?: RequestInit,
): Promise<Response> {
  let url = typeof input === 'string' ? input : input.url;
  const method = init?.method ?? 'GET';
  const body = init?.body;

  let headers = normalizeHeaders(init?.headers);
  // Move apikey to query param on Android
  ({ url, headers } = apikeyToQueryParam(url, headers));

  return new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = 30_000;

    for (const [k, v] of Object.entries(headers)) {
      xhr.setRequestHeader(k, v);
    }

    xhr.onload = () => {
      // Parse response headers into a Headers object
      const rawHeaders = xhr.getAllResponseHeaders();
      const headerMap: Record<string, string> = {};
      rawHeaders
        .trim()
        .split(/[\r\n]+/)
        .forEach((line: string) => {
          const idx = line.indexOf(':');
          if (idx > 0) {
            headerMap[line.substring(0, idx).trim().toLowerCase()] = line
              .substring(idx + 1)
              .trim();
          }
        });

      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headerMap,
        }),
      );
    };

    xhr.onerror = () =>
      reject(new TypeError(`Network request failed (XHR) [${url.substring(0, 60)}]`));
    xhr.ontimeout = () =>
      reject(new TypeError(`Request timeout (XHR, 30s) [${url.substring(0, 60)}]`));

    xhr.send(typeof body === 'string' || body == null ? body : String(body));
  });
}

// ── Connection warmup ───────────────────────────────────────────────────────
// Pre-warm OkHttp connection pool to supabase.co on Android. This must run
// BEFORE any Supabase auth calls to avoid the cold-start failure.
let _warmupDone = false;
let _warmupPromise: Promise<boolean> | null = null;

export function warmupConnection(): Promise<boolean> {
  if (_warmupDone) return Promise.resolve(true);
  if (_warmupPromise) return _warmupPromise;

  if (Platform.OS !== 'android') {
    _warmupDone = true;
    return Promise.resolve(true);
  }

  _warmupPromise = (async () => {
    // On Android, apikey goes in query param to bypass New Arch header bug
    const baseUrl = `${supabaseUrl}/auth/v1/health`;
    const url =
      Platform.OS === 'android'
        ? `${baseUrl}?apikey=${encodeURIComponent(supabaseAnonKey)}`
        : baseUrl;
    const headers =
      Platform.OS === 'android' ? undefined : { apikey: supabaseAnonKey };

    // Attempt 1: native fetch with generous timeout
    for (let i = 0; i < 3; i++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8_000);
        await fetch(url, {
          method: 'GET',
          ...(headers && { headers }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        _warmupDone = true;
        return true;
      } catch {
        // Wait with exponential backoff: 500ms, 1500ms, 3000ms
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }

    // Attempt 2: XHR fallback (also uses query param on Android via xhrFetch)
    try {
      await xhrFetch(baseUrl, {
        method: 'GET',
        headers: { apikey: supabaseAnonKey } as any,
      });
      _warmupDone = true;
      return true;
    } catch {
      // Connection warmup failed — proceed anyway, the retry logic will handle it
    }

    return false;
  })();

  return _warmupPromise;
}

// ── Custom fetch with retry + XHR fallback ──────────────────────────────────
/**
 * Custom fetch wrapper for Android release builds.
 * Android release builds fail on the first fetch to new hosts due to OkHttp
 * connection pool cold starts. Strategy:
 * 1. Try native fetch with increasing delays between retries
 * 2. If all native fetch attempts fail, try XHR as a last resort
 * 3. Report detailed error context for diagnostics
 */
const supabaseFetch: typeof fetch = async (input, init) => {
  // On non-Android, just use native fetch with no retries
  if (Platform.OS !== 'android') {
    return fetch(input, init);
  }

  // On Android: move `apikey` from header to query param to bypass
  // New Architecture TurboModule networking bug with custom headers.
  let url = typeof input === 'string' ? input : (input as Request).url;
  let headers = normalizeHeaders(init?.headers);
  ({ url, headers } = apikeyToQueryParam(url, headers));

  const patchedInit: RequestInit = { ...init, headers };
  const maxNativeRetries = 3;
  let lastError: any;

  // Phase 1: Native fetch with escalating delays
  for (let attempt = 0; attempt <= maxNativeRetries; attempt++) {
    try {
      const response = await fetch(url, patchedInit);
      return response;
    } catch (error: any) {
      lastError = error;
      if (attempt < maxNativeRetries) {
        // Escalating backoff: 300ms, 800ms, 1500ms, 3000ms
        await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt)));
      }
    }
  }

  // Phase 2: XHR fallback — different native module code path
  // (xhrFetch also applies apikeyToQueryParam internally)
  try {
    const response = await xhrFetch(url, patchedInit as any);
    return response;
  } catch (xhrError: any) {
    // Both native fetch and XHR failed — throw with comprehensive context
    const enhanced = new TypeError(
      `Supabase unreachable after ${maxNativeRetries + 1} fetch retries + XHR fallback. ` +
        `fetch: ${lastError?.message ?? 'unknown'}. ` +
        `XHR: ${xhrError?.message ?? 'unknown'}. ` +
        `[${url?.substring(0, 60)}]`,
    );
    throw enhanced;
  }
};

// ── Supabase client ─────────────────────────────────────────────────────────

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // Native sign-in (Google/Apple) uses signInWithIdToken — no URL session detection needed
    detectSessionInUrl: false,
  },
  global: {
    fetch: supabaseFetch,
  },
});

// ── Startup URL validation ──────────────────────────────────────────────────
// Verify the URL polyfill is working and Supabase client URLs are correct.
// This catches polyfill loading order bugs that silently produce wrong URLs.
try {
  const testUrl = new URL('auth/v1', supabaseUrl + '/');
  const expectedPrefix = supabaseUrl.replace(/\/$/, '') + '/auth/v1';
  if (!testUrl.href.startsWith(expectedPrefix)) {
    console.error(
      `[Sola] URL polyfill may be broken. Expected "${expectedPrefix}", got "${testUrl.href}". ` +
        'Supabase requests will likely fail.',
    );
  }
} catch (e) {
  console.error(
    '[Sola] URL constructor failed — react-native-url-polyfill may not be loaded.',
    e,
  );
}

// ── Network diagnostics ─────────────────────────────────────────────────────
/**
 * Comprehensive network diagnostic for Android release builds.
 * Tests multiple networking approaches to identify the exact failure point.
 */
export async function diagnoseNetwork(): Promise<{
  ok: boolean;
  fetchWorks: boolean;
  supabaseReachable: boolean;
  details: string;
}> {
  const result = {
    ok: false,
    fetchWorks: false,
    supabaseReachable: false,
    details: '',
  };

  const lines: string[] = [];
  lines.push(`Platform: ${Platform.OS} (${Platform.Version})`);
  lines.push(`Config: ${getConfigDigest()}`);

  const urlPolyfillOk = typeof globalThis.URL === 'function';
  lines.push(`URL polyfill: ${urlPolyfillOk ? 'loaded' : 'MISSING'}`);

  // Validate URL construction
  try {
    const testUrl = new URL('auth/v1', supabaseUrl + '/');
    lines.push(`URL("auth/v1", base).href = ${testUrl.href.substring(0, 50)}`);
  } catch (e: any) {
    lines.push(`URL construction: FAILED (${e.message})`);
  }

  // Test 1: Does fetch() exist?
  if (typeof fetch !== 'function') {
    result.details = 'fetch is not a function';
    return result;
  }

  // Test 2: Can we reach Google? (baseline connectivity)
  const t2Start = Date.now();
  try {
    await fetch('https://www.google.com/generate_204', { method: 'HEAD' });
    result.fetchWorks = true;
    lines.push(`Google: OK (${Date.now() - t2Start}ms)`);
  } catch (e: any) {
    lines.push(`Google: FAIL (${Date.now() - t2Start}ms, ${e.message})`);
    result.details = lines.join('\n');
    return result;
  }

  // Test 3: HEAD to Supabase root — no headers, simplest possible request
  const t3Start = Date.now();
  try {
    await fetch(supabaseUrl, { method: 'HEAD' });
    lines.push(`Supabase HEAD (no headers): OK (${Date.now() - t3Start}ms)`);
  } catch (e: any) {
    lines.push(
      `Supabase HEAD (no headers): FAIL (${Date.now() - t3Start}ms, ${e.name}: ${e.message})`,
    );
  }

  // Test 4: GET with apikey as HEADER (known to fail on Android New Arch)
  const t4Start = Date.now();
  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: supabaseAnonKey },
    });
    result.supabaseReachable = true;
    result.ok = true;
    lines.push(`apikey header: ${r.status} (${Date.now() - t4Start}ms)`);
  } catch (e: any) {
    lines.push(
      `apikey header: FAIL (${Date.now() - t4Start}ms, ${e.name}: ${e.message})`,
    );
  }

  // Test 5: GET with apikey as QUERY PARAM (the fix for Android New Arch)
  const t5Start = Date.now();
  try {
    const r = await fetch(
      `${supabaseUrl}/auth/v1/health?apikey=${encodeURIComponent(supabaseAnonKey)}`,
      { method: 'GET' },
    );
    lines.push(`apikey query: ${r.status} (${Date.now() - t5Start}ms)`);
    if (!result.supabaseReachable) {
      result.supabaseReachable = true;
      result.ok = true;
    }
  } catch (e: any) {
    lines.push(
      `apikey query: FAIL (${Date.now() - t5Start}ms, ${e.name}: ${e.message})`,
    );
  }

  // Test 6: GET with Authorization header (standard header — should work)
  const t6Start = Date.now();
  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/health?apikey=${encodeURIComponent(supabaseAnonKey)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${supabaseAnonKey}` },
    });
    lines.push(`Auth header + query: ${r.status} (${Date.now() - t6Start}ms)`);
  } catch (e: any) {
    lines.push(
      `Auth header + query: FAIL (${Date.now() - t6Start}ms, ${e.message})`,
    );
  }

  // Test 7: Cloudflare endpoint to rule out device-wide TLS issue
  const t7Start = Date.now();
  try {
    await fetch('https://cloudflare.com/cdn-cgi/trace', { method: 'HEAD' });
    lines.push(`Cloudflare: OK (${Date.now() - t7Start}ms)`);
  } catch (e: any) {
    lines.push(`Cloudflare: FAIL (${Date.now() - t7Start}ms, ${e.message})`);
  }

  result.details = lines.join('\n');
  return result;
}
