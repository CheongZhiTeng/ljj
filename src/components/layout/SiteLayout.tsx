import { ArrowUp, Languages, Menu, MoonStar, Sparkle, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { usePreferences } from '../../contexts/preferences';
import type { ThemePreference } from '../../types/profile';
import { Container } from './Container';

export type NavigationSection = 'about' | 'interests' | 'music' | 'quiz';

export function SiteLayout({
  title,
  sections,
  children,
  editor,
}: {
  title: string;
  sections: NavigationSection[];
  children: ReactNode;
  editor?: () => void;
}) {
  const { t, locale, setLocale, theme, setTheme } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('skip')}
      </a>
      <header className="site-header" id="top">
        <Container>
          <div className="header-row">
            <a className="wordmark" href="#top">
              <Sparkle size={23} aria-hidden="true" />
              {title}
            </a>
            <button
              className="button icon-button menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="main-nav"
              aria-label={t(menuOpen ? 'closeMenu' : 'openMenu')}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X aria-hidden="true" />
              ) : (
                <Menu aria-hidden="true" />
              )}
            </button>
            <nav
              id="main-nav"
              className={menuOpen ? 'nav-links is-open' : 'nav-links'}
              aria-label={t('nav')}
            >
              <a href="#top" onClick={() => setMenuOpen(false)}>
                {t('home')}
              </a>
              {sections.map((section) => (
                <a
                  key={section}
                  href={'#' + section}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(section)}
                </a>
              ))}
            </nav>
            <div className="preferences">
              <label className="select-control">
                <MoonStar size={16} aria-hidden="true" />
                <select
                  aria-label={t('theme')}
                  value={theme}
                  onChange={(event) =>
                    setTheme(event.target.value as ThemePreference)
                  }
                >
                  <option value="dark">{t('dark')}</option>
                  <option value="light">{t('light')}</option>
                  <option value="system">{t('system')}</option>
                </select>
              </label>
              <button
                className="button locale-button"
                aria-label={
                  t('language') + ' · ' + (locale === 'zh' ? 'English' : '华文')
                }
                onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              >
                <Languages size={17} aria-hidden="true" />
                <span>{locale === 'zh' ? 'EN' : '华文'}</span>
              </button>
            </div>
          </div>
        </Container>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Container>{children}</Container>
      </main>
      <footer className="site-footer">
        <Container>
          <div className="footer-row">
            <span className="wordmark">
              <Sparkle size={18} aria-hidden="true" />
              {title}
            </span>
            <div className="button-row">
              {editor && (
                <button className="button" onClick={editor}>
                  {t('edit')}
                </button>
              )}
              <a className="button" href="#top">
                {t('top')} <ArrowUp size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}
