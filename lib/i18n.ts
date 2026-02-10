/**
 * i18n configuration — initializes i18next with lazy-loaded language bundles.
 *
 * Only English is bundled. Other languages are loaded on demand
 * from the locales directory to keep the initial bundle small.
 *
 * Supported: en, fr, es, pt, de, ja, ko, it
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// English is always bundled (fallback language)
import en from '@/locales/en/common.json';

const LANGUAGE_STORAGE_KEY = 'sola_language';
const SUPPORTED_LANGS = ['en', 'fr', 'es', 'pt', 'de', 'ja', 'ko', 'it'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGS)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Fran\u00E7ais',
  es: 'Espa\u00F1ol',
  pt: 'Portugu\u00EAs',
  de: 'Deutsch',
  ja: '\u65E5\u672C\u8A9E',
  ko: '\uD55C\uAD6D\uC5B4',
  it: 'Italiano',
};

/**
 * Lazy-load a language bundle. Returns the translation object or null on failure.
 */
async function loadLanguageBundle(lang: string): Promise<Record<string, any> | null> {
  try {
    switch (lang) {
      case 'fr': return (await import('@/locales/fr/common.json')).default;
      case 'es': return (await import('@/locales/es/common.json')).default;
      case 'pt': return (await import('@/locales/pt/common.json')).default;
      case 'de': return (await import('@/locales/de/common.json')).default;
      case 'ja': return (await import('@/locales/ja/common.json')).default;
      case 'ko': return (await import('@/locales/ko/common.json')).default;
      case 'it': return (await import('@/locales/it/common.json')).default;
      default: return null;
    }
  } catch {
    return null;
  }
}

function getDeviceLanguage(): string {
  const locales = Localization.getLocales();
  const deviceLang = locales[0]?.languageCode || 'en';
  return SUPPORTED_LANGS.includes(deviceLang as SupportedLanguage) ? deviceLang : 'en';
}

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGS.includes(lang as SupportedLanguage);
}

export function getSupportedLanguages(): Array<{ code: SupportedLanguage; label: string }> {
  return SUPPORTED_LANGS.map((code) => ({
    code,
    label: LANGUAGE_LABELS[code],
  }));
}

/**
 * Change the active language. Lazy-loads the bundle if needed,
 * then persists the choice to AsyncStorage.
 */
export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  if (lang !== 'en' && !i18n.hasResourceBundle(lang, 'translation')) {
    const bundle = await loadLanguageBundle(lang);
    if (bundle) {
      i18n.addResourceBundle(lang, 'translation', bundle, true, true);
    }
  }
  await i18n.changeLanguage(lang);
  AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang).catch(() => {});
}

/**
 * Initialize i18n. Call once at app startup.
 * Restores the user's saved language preference, falling back to device language.
 */
export async function initI18n(): Promise<void> {
  let savedLang: string | null = null;
  try {
    savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    // ignore
  }

  const initialLang = (savedLang && isSupportedLanguage(savedLang))
    ? savedLang
    : getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
    },
    lng: 'en', // Start with English, then switch
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  // If the target language isn't English, lazy-load and switch
  if (initialLang !== 'en') {
    await changeLanguage(initialLang as SupportedLanguage);
  }
}

export default i18n;
