import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavCrumb {
  /** Display name for this level */
  label: string;
  /** Expo Router path to navigate to (e.g., '/(tabs)/discover') */
  path: string;
}

interface UseNavContextOptions {
  /** Current page display name */
  title: string;
  /** Expo Router path for this page */
  path: string;
  /**
   * Fallback crumbs when arriving via deep link (no _navCrumbs param).
   * Should represent the logical hierarchy above this page.
   * Example for a city page: [{ label: 'Discover', path: '/(tabs)/discover' }, ...]
   */
  fallbackCrumbs?: NavCrumb[];
}

interface NavContext {
  /** Label for the back button — the immediate parent's name */
  parentTitle: string | undefined;
  /** Path for smart-back fallback (deep link with no history) */
  parentPath: string | undefined;
  /** Ancestor chain above the parent — for context subtitle (shown at depth 3+) */
  ancestors: NavCrumb[];
  /** Total depth (0 = root, 1 = one push, etc.) */
  depth: number;
  /** Spread into router.push() params when navigating to a child screen */
  childNavParams: {
    _navCrumbs: string;
  };
  /** Smart back handler — uses history when available, logical parent otherwise */
  handleBack: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages navigation context for the universal navigation system.
 *
 * Screens pass a single `_navCrumbs` param (JSON array of NavCrumb)
 * that represents the full path above the current screen.
 *
 * The last crumb = parent (back button label).
 * Everything before = ancestors (context subtitle at depth 3+).
 *
 * For deep links with no params, falls back to data-driven crumbs.
 */
export function useNavContext(options: UseNavContextOptions): NavContext {
  const params = useLocalSearchParams<{ _navCrumbs?: string }>();
  const router = useRouter();

  return useMemo(() => {
    // ── Parse crumbs ──────────────────────────────────────────
    let crumbs: NavCrumb[] = [];

    if (params._navCrumbs) {
      try {
        crumbs = JSON.parse(params._navCrumbs);
      } catch {
        crumbs = options.fallbackCrumbs ?? [];
      }
    } else {
      crumbs = options.fallbackCrumbs ?? [];
    }

    // ── Derive parent + ancestors ─────────────────────────────
    const parentCrumb = crumbs.length > 0 ? crumbs[crumbs.length - 1] : undefined;
    const parentTitle = parentCrumb?.label;
    const parentPath = parentCrumb?.path;
    const ancestors = crumbs.length > 1 ? crumbs.slice(0, -1) : [];
    const depth = crumbs.length;

    // ── Build child params ────────────────────────────────────
    // Append current page to the crumb chain for the next screen
    const childCrumbs: NavCrumb[] = [
      ...crumbs,
      { label: options.title, path: options.path },
    ];

    const childNavParams = {
      _navCrumbs: JSON.stringify(childCrumbs),
    };

    // ── Smart back ────────────────────────────────────────────
    const handleBack = () => {
      if (router.canGoBack()) {
        router.back();
      } else if (parentPath) {
        // Deep link — no history. Navigate to logical parent.
        (router as any).replace(parentPath);
      } else {
        // Ultimate fallback — go to tab root
        router.back();
      }
    };

    return {
      parentTitle,
      parentPath,
      ancestors,
      depth,
      childNavParams,
      handleBack,
    };
  }, [params._navCrumbs, options.title, options.path, options.fallbackCrumbs, router]);
}
