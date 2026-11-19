import { useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { usePreferences } from '../../contexts/preferences';

export function Sharing({
  title,
  canonicalUrl,
}: {
  title: string;
  canonicalUrl?: string;
}) {
  const { t } = usePreferences();
  const [status, setStatus] = useState<'copied' | 'manual' | null>(null);
  const url = canonicalUrl || location.origin + location.pathname;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('manual');
    }
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        setStatus(null);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    await copy();
  }
  return (
    <div className="share-controls">
      <div className="button-row">
        <button className="button" onClick={share}>
          <Share2 size={17} aria-hidden="true" />
          {t('share')}
        </button>
        <button
          className="button icon-button"
          aria-label={t('copy')}
          title={t('copy')}
          onClick={copy}
        >
          <Copy size={17} aria-hidden="true" />
        </button>
      </div>
      <div role="status">
        {status === 'copied' && t('copied')}
        {status === 'manual' && t('shareFailed')}
      </div>
      {status === 'manual' && (
        <input
          aria-label={t('copy')}
          value={url}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
