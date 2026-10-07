import type { Language } from './types';

const STORAGE_KEY = 'app_language';

/**
 * Checks if the system timezone points to Vietnam
 */
export function isVietnamTimezone(): boolean {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) return false;
    const tzLower = timeZone.toLowerCase();
    return tzLower.includes('ho_chi_minh') || tzLower.includes('saigon') || tzLower === 'asia/hcm';
  } catch {
    return false;
  }
}

/**
 * Checks if the user's browser/system locale is Vietnamese
 */
export function isVietnameseLocale(): boolean {
  try {
    const languages = typeof navigator !== 'undefined'
      ? (navigator.languages || [navigator.language])
      : [];

    return languages.some((lang) => {
      const l = lang.toLowerCase();
      return l.startsWith('vi') || l.includes('vi-vn');
    });
  } catch {
    return false;
  }
}

/**
 * Detects language synchronously on initial load.
 * Priority:
 * 1. Saved localStorage preference
 * 2. Vietnam Timezone / Geo-heuristic -> 'vi'
 * 3. System Language (Vietnamese) -> 'vi'
 * 4. Default for everywhere else -> 'en'
 */
export function detectInitialLanguage(): Language {
  // 1. Check localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'vi' || stored === 'en') {
        return stored;
      }
    } catch {
      // localStorage may fail in restricted environments
    }
  }

  // 2. Geographic / Timezone heuristic for Vietnam
  if (isVietnamTimezone()) {
    return 'vi';
  }

  // 3. System language check
  if (isVietnameseLocale()) {
    return 'vi';
  }

  // 4. Default for international users outside Vietnam
  return 'en';
}

/**
 * Saves user language preference to localStorage
 */
export function persistLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  }
}

/**
 * Optional background geo-detection using IP lookup.
 * Runs non-blocking to confirm geographic location for users without explicit localStorage choice.
 */
export async function detectGeoCountryAsync(): Promise<string | null> {
  // Check if user already has an explicit preference in localStorage
  try {
    if (localStorage.getItem(STORAGE_KEY)) {
      return null; // Don't override explicit preference
    }
  } catch {
    // continue
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return (data.country_code as string) || (data.country as string) || null;
    }
  } catch {
    // Network or abort error, fail silently
  }

  return null;
}

