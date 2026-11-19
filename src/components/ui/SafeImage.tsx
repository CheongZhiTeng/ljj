import { useState, type ReactNode } from 'react';
import { assetUrl } from '../../config/profile';
import { usePreferences } from '../../contexts/preferences';
import type { MediaAsset } from '../../types/profile';

export function SafeImage({
  image,
  fallback,
  eager = false,
}: {
  image?: MediaAsset;
  fallback: ReactNode;
  eager?: boolean;
}) {
  const [failedSource, setFailedSource] = useState('');
  const { localize } = usePreferences();
  if (!image || failedSource === image.src) return fallback;
  return (
    <img
      src={assetUrl(image.src)}
      alt={localize(image.alt)}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailedSource(image.src)}
    />
  );
}
