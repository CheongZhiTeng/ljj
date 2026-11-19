import { lazy, Suspense, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { profileConfig } from './config/profile';
import { PreferenceProvider } from './contexts/PreferenceProvider';
import { HomePage } from './pages/HomePage';

const Editor = import.meta.env.DEV
  ? lazy(() => import('./editor/ProfileEditor'))
  : null;

export default function App() {
  const [config, setConfig] = useState(profileConfig);
  const [editing, setEditing] = useState(false);
  const [revision, setRevision] = useState(0);
  return (
    <MotionConfig reducedMotion="user">
      <PreferenceProvider
        key={revision}
        initialLocale={config.localization.defaultLocale}
        initialTheme={config.theme.preference}
      >
        <HomePage
          config={config}
          edit={Editor ? () => setEditing(true) : undefined}
        />
      </PreferenceProvider>
      {Editor && editing && (
        <Suspense>
          <Editor
            config={config}
            update={(value) => {
              setConfig(value);
              if (
                value.theme.preference !== config.theme.preference ||
                value.localization.defaultLocale !==
                  config.localization.defaultLocale
              ) {
                try {
                  if (value.theme.preference !== config.theme.preference)
                    localStorage.removeItem('hub-theme');
                  if (
                    value.localization.defaultLocale !==
                    config.localization.defaultLocale
                  )
                    localStorage.removeItem('hub-locale');
                } catch {
                  /* Storage is optional. */
                }
                setRevision((current) => current + 1);
              }
            }}
            close={() => setEditing(false)}
          />
        </Suspense>
      )}
    </MotionConfig>
  );
}
