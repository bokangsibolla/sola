import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ── DEBUG FLAG — set to false when done diagnosing release build issue ───────
const SOLA_DEBUG_NETWORK = false;

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://bfyewxgdfkmkviajmfzp.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeWV3eGdkZmtta3ZpYWptZnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjY1ODIsImV4cCI6MjA4NTYwMjU4Mn0.qzY2p1EP5tOsi2EcHGJScodkcMKCf-KaSb3IGFD6fgM';

// ── Build-time validation ───────────────────────────────────────────────────
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
const hasLocalStorage =
  Platform.OS === 'web' && typeof localStorage !== 'undefined';

const AsyncStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (hasLocalStorage) {
      return localStorage.getItem(key);
    }
    if (Platform.OS === 'web') return null; // SSR — no storage available
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (hasLocalStorage) {
      localStorage.setItem(key, value);
      return;
    }
    if (Platform.OS === 'web') return; // SSR
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (hasLocalStorage) {
      localStorage.removeItem(key);
      return;
    }
    if (Platform.OS === 'web') return; // SSR
    await AsyncStorage.removeItem(key);
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── XHR-based fetch ─────────────────────────────────────────────────────────
// React Native 0.81 New Architecture TurboModule networking on Android has a
// bug where native fetch() fails for ANY request with custom headers (apikey,
// Authorization, etc). XMLHttpRequest uses a different native module code path
// (bridge-based) that does not have this bug. On Android, we use XHR as the
// primary fetch implementation with all headers intact.

function xhrFetch(
  input: string | Request,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === 'string' ? input : input.url;
  const method = init?.method ?? 'GET';
  const body = init?.body;
  const headers = normalizeHeaders(init?.headers);

  return new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = 30_000;

    // Send ALL headers as-is — no stripping, no query-param workarounds
    for (const [k, v] of Object.entries(headers)) {
      xhr.setRequestHeader(k, v);
    }

    xhr.onload = () => {
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

// ── Resilient Android fetch ──────────────────────────────────────────────
// Try native fetch first (works in EAS production builds). If native fetch
// fails (TurboModule header bug on some devices), fall back to XHR which
// uses the bridge networking path.

const _nativeFetch = globalThis.fetch;
let _useXhr = false;

function androidFetch(
  input: URL | RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === 'string' ? input : (input as Request).url ?? String(input);
  const method = init?.method ?? 'GET';

  if (SOLA_DEBUG_NETWORK) {
    const urlPath = url.replace(supabaseUrl, '').split('?')[0];
    console.log(
      `[Sola Fetch] ${method} ${urlPath.substring(0, 60)} | ` +
      `transport=${_useXhr ? 'XHR' : 'NATIVE'}`,
    );
  }

  if (_useXhr) {
    return xhrFetch(url, init);
  }

  return _nativeFetch(url, init)
    .catch((nativeErr) => {
      console.warn(
        `[Sola] Native fetch failed for ${url.substring(0, 60)}: ${(nativeErr as Error).message} — trying XHR`,
      );
      return xhrFetch(url, init)
        .then((r) => {
          // XHR worked where native didn't — switch permanently
          _useXhr = true;
          console.log('[Sola] XHR succeeded — switching to XHR for all future requests');
          return r;
        })
        .catch(() => {
          // Both failed — throw native error (more useful)
          throw nativeErr;
        });
    });
}

// ── Supabase client ─────────────────────────────────────────────────────
// On Android, use resilient fetch: native fetch first (works in EAS builds),
// XHR fallback (works on devices with TurboModule header bug).

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: Platform.OS === 'android' ? androidFetch : undefined,
  },
});

// ── Startup URL validation ──────────────────────────────────────────────────
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

  try {
    const testUrl = new URL('auth/v1', supabaseUrl + '/');
    lines.push(`URL("auth/v1", base).href = ${testUrl.href.substring(0, 50)}`);
  } catch (e: any) {
    lines.push(`URL construction: FAILED (${e.message})`);
  }

  if (typeof fetch !== 'function') {
    result.details = 'fetch is not a function';
    return result;
  }

  // Test 1: Google baseline
  const t1Start = Date.now();
  try {
    await fetch('https://www.google.com/generate_204', { method: 'HEAD' });
    result.fetchWorks = true;
    lines.push(`Google: OK (${Date.now() - t1Start}ms)`);
  } catch (e: any) {
    lines.push(`Google: FAIL (${Date.now() - t1Start}ms, ${e.message})`);
    result.details = lines.join('\n');
    return result;
  }

  // Test 2: Supabase HEAD (no headers)
  const t2Start = Date.now();
  try {
    await fetch(supabaseUrl, { method: 'HEAD' });
    lines.push(`Supabase HEAD (no headers): OK (${Date.now() - t2Start}ms)`);
  } catch (e: any) {
    lines.push(`Supabase HEAD: FAIL (${Date.now() - t2Start}ms, ${e.message})`);
  }

  // Test 3: Native fetch with apikey header
  const t3Start = Date.now();
  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: supabaseAnonKey },
    });
    lines.push(`fetch+apikey header: ${r.status} (${Date.now() - t3Start}ms)`);
    result.supabaseReachable = true;
    result.ok = true;
  } catch (e: any) {
    lines.push(`fetch+apikey header: FAIL (${Date.now() - t3Start}ms, ${e.message})`);
  }

  // Test 4: XHR with apikey header (the actual fix)
  const t4Start = Date.now();
  try {
    const r = await xhrFetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: supabaseAnonKey } as any,
    });
    lines.push(`XHR+apikey header: ${r.status} (${Date.now() - t4Start}ms)`);
    if (!result.supabaseReachable) {
      result.supabaseReachable = true;
      result.ok = true;
    }
  } catch (e: any) {
    lines.push(`XHR+apikey header: FAIL (${Date.now() - t4Start}ms, ${e.message})`);
  }

  // Test 5: XHR with Authorization header
  const t5Start = Date.now();
  try {
    const r = await xhrFetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      } as any,
    });
    lines.push(`XHR+Auth header: ${r.status} (${Date.now() - t5Start}ms)`);
  } catch (e: any) {
    lines.push(`XHR+Auth header: FAIL (${Date.now() - t5Start}ms, ${e.message})`);
  }

  // Test 6: Cloudflare
  const t6Start = Date.now();
  try {
    await fetch('https://cloudflare.com/cdn-cgi/trace', { method: 'HEAD' });
    lines.push(`Cloudflare: OK (${Date.now() - t6Start}ms)`);
  } catch (e: any) {
    lines.push(`Cloudflare: FAIL (${Date.now() - t6Start}ms, ${e.message})`);
  }

  result.details = lines.join('\n');
  return result;
}

// ── Startup health check (temporary diagnostic) ────────────────────────────
// Runs once on app startup to verify the full request chain works.
// Remove when done debugging release build issue.
export async function runHealthCheck(): Promise<void> {
  if (!SOLA_DEBUG_NETWORK) return;

  const tag = '[Sola HealthCheck]';
  console.log(`${tag} ─── Starting health check ───`);
  console.log(`${tag} Platform: ${Platform.OS} (${Platform.Version})`);
  console.log(`${tag} __DEV__: ${__DEV__}`);
  console.log(`${tag} Supabase URL domain: ${supabaseUrl.replace('https://', '').split('.')[0]}`);
  console.log(`${tag} Anon key exists: ${!!supabaseAnonKey && supabaseAnonKey.length > 10}`);
  console.log(`${tag} Anon key preview: ${supabaseAnonKey.slice(0, 12)}…${supabaseAnonKey.slice(-6)}`);
  console.log(`${tag} Android fetch transport: ${_useXhr ? 'XHR (native failed earlier!)' : 'NATIVE (primary)'}`);

  // 1. Check session
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error(`${tag} getSession ERROR: ${error.message}`);
    } else if (session) {
      console.log(`${tag} Session: userId=${session.user.id.substring(0, 8)}, expires=${new Date(session.expires_at! * 1000).toISOString()}`);
      console.log(`${tag} Access token preview: ${session.access_token.substring(0, 20)}…`);
    } else {
      console.log(`${tag} Session: null (not logged in)`);
    }
  } catch (e: any) {
    console.error(`${tag} getSession THREW: ${e.message}`);
  }

  // 2. Lightweight data query — try reading 1 row from countries (public table)
  try {
    const { data, error, status } = await supabase
      .from('countries')
      .select('id, name')
      .limit(1)
      .single();
    console.log(`${tag} Data query (countries): status=${status}, error=${error?.message ?? 'none'}, got=${data ? data.name : 'null'}`);
  } catch (e: any) {
    console.error(`${tag} Data query THREW: ${e.message}`);
  }

  // 3. Check fetch transport state after queries
  console.log(`${tag} Post-query transport: ${_useXhr ? 'XHR (switched!)' : 'NATIVE (still primary)'}`);
  console.log(`${tag} ─── Health check complete ───`);
}
