import { useEffect, useState } from 'react';
import { messages } from '../i18n/messages';
import type { Locale, ThemePreference } from '../types/profile';
import { readPreference, savePreference } from '../utils/storage';
import {
  localizedText,
  PreferenceContext,
  type PreferenceChildren,
} from './preferences';

interface Props extends PreferenceChildren {
  initialLocale: Locale;
  initialTheme: ThemePreference;
}

export function PreferenceProvider({
  children,
  initialLocale,
  initialTheme,
}: Props) {
  const [locale, setLocale] = useState(() => {
    const saved = readPreference('hub-locale');
    return saved === 'en' || saved === 'zh' ? saved : initialLocale;
  });
  const [theme, setTheme] = useState(() => {
    const saved = readPreference('hub-theme');
    return saved === 'dark' || saved === 'light' || saved === 'system'
      ? saved
      : initialTheme;
  });
  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-Hans';
    savePreference('hub-locale', locale);
  }, [locale]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    savePreference('hub-theme', theme);
  }, [theme]);
  return (
    <PreferenceContext.Provider
      value={{
        locale,
        setLocale,
        theme,
        setTheme,
        t: (key) => messages[locale][key],
        localize: (value) => localizedText(value, locale),
      }}
    >
      {children}
    </PreferenceContext.Provider>
  );
}
