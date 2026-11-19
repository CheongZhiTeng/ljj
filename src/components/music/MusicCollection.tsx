import { lazy, Suspense } from 'react';
import { ArrowUpRight, Disc3 } from 'lucide-react';
import { usePreferences } from '../../contexts/preferences';
import type { ProfileConfig } from '../../types/profile';

const MusicPlayer = lazy(() => import('./MusicPlayer'));

export function MusicCollection({ music }: { music: ProfileConfig['music'] }) {
  const { t, localize } = usePreferences();
  return (
    <div className="music-layout">
      <div className="panel music-intro">
        <div className="record-art" aria-hidden="true">
          <Disc3 />
        </div>
        {music.playlist.length > 0 ? (
          <Suspense fallback={<p role="status">{t('loading')}</p>}>
            <MusicPlayer key={JSON.stringify(music.playlist)} config={music} />
          </Suspense>
        ) : (
          <p>{t('unavailable')}</p>
        )}
      </div>
      {music.collection.length > 0 && (
        <dl className="panel music-list">
          {music.collection.map((entry, index) => (
            <div key={index}>
              <dt>{localize(entry.label)}</dt>
              <dd>
                {entry.url ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={entry.value + t('opens')}
                  >
                    {entry.value} <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                ) : (
                  entry.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
