import { createContext, useContext } from 'react';
import type { Locale, Localized, ThemePreference } from '../types/profile';
import { messages } from '../i18n/messages';
import type { ReactNode } from 'react';

export interface Preferences {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  t: (key: keyof typeof messages.en) => string;
  localize: (text?: Localized) => string;
}

export const PreferenceContext = createContext<Preferences | null>(null);

export function usePreferences() {
  const preferences = useContext(PreferenceContext);
  if (!preferences) throw new Error('Preference provider is missing.');
  return preferences;
}

export function localizedText(text: Localized | undefined, locale: Locale) {
  return text?.[locale]?.trim() || text?.zh.trim() || text?.en?.trim() || '';
}

export type PreferenceChildren = { children: ReactNode };
