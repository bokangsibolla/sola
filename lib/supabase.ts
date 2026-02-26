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

// ── Resilient Android fetch ──────────────────────────────────────────────────
// Try XHR first (bypasses TurboModule header bug). If XHR fails on this device,
// permanently switch to native fetch for all subsequent requests.
// This handles devices where XHR works (most) AND devices where native fetch
// works but XHR doesn't (some OEM Android builds).

const _nativeFetch = globalThis.fetch;
let _useNativeFetch = false;

function androidFetch(
  input: URL | RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === 'string' ? input : (input as Request).url ?? String(input);

  if (_useNativeFetch) {
    return _nativeFetch(url, init);
  }

  return xhrFetch(url, init).catch((xhrErr) => {
    console.warn(
      `[Sola] XHR failed for ${url.substring(0, 60)}: ${(xhrErr as Error).message} — switching to native fetch`,
    );
    _useNativeFetch = true;
    return _nativeFetch(url, init).catch(() => {
      // Both failed — throw original XHR error (more descriptive)
      throw xhrErr;
    });
  });
}

// ── Supabase client ─────────────────────────────────────────────────────────
// Android TurboModule networking (New Architecture) breaks native fetch() with
// custom headers on some devices. XHR uses the bridge path which works on most.
// androidFetch tries XHR first, then falls back to native fetch.

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
