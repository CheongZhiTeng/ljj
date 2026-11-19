import { ArrowDown, Globe2, MapPin, Sparkle } from 'lucide-react';
import { usePreferences } from '../../contexts/preferences';
import type { ProfileConfig } from '../../types/profile';
import { Sharing } from '../social/Sharing';
import { SafeImage } from '../ui/SafeImage';

export function Hero({
  config,
  nextSection,
}: {
  config: ProfileConfig;
  nextSection?: string;
}) {
  const { website, profile } = config;
  const { t, localize } = usePreferences();
  const name = profile.displayName || website.title;
  return (
    <section className="hero" aria-labelledby="profile-title">
      <div className="hero-copy">
        {localize(website.subtitle) && (
          <p className="hero-kicker">
            <Sparkle size={15} aria-hidden="true" />
            {localize(website.subtitle)}
          </p>
        )}
        <h1 id="profile-title">{name}</h1>
        {profile.aliases.length > 0 && (
          <p className="alias">
            {t('alias')} <span>{profile.aliases.join(' / ')}</span>
          </p>
        )}
        {localize(website.welcome) && (
          <p className="welcome">{localize(website.welcome)}</p>
        )}
        {localize(profile.bio) && (
          <p className="muted">{localize(profile.bio)}</p>
        )}
        <ul className="profile-facts" aria-label={t('profile')}>
          {profile.region && (
            <li>
              <MapPin size={15} aria-hidden="true" />
              {localize(profile.region)}
            </li>
          )}
          {profile.languages.length > 0 && (
            <li>
              <Globe2 size={15} aria-hidden="true" />
              {profile.languages.map(localize).join(' / ')}
            </li>
          )}
          {profile.mbti && <li>{profile.mbti}</li>}
          {profile.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="hero-actions">
          {nextSection && (
            <a className="button primary" href={'#' + nextSection}>
              {t('meet')} <ArrowDown size={17} aria-hidden="true" />
            </a>
          )}
          <Sharing title={website.title} canonicalUrl={website.canonicalUrl} />
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-banner">
          <SafeImage image={profile.banner} fallback={null} eager />
        </div>
        <div className="orbit orbit-one" aria-hidden="true" />
        <div className="orbit orbit-two" aria-hidden="true" />
        <div className="orbit orbit-three" aria-hidden="true" />
        <span className="orbit-star star-one" aria-hidden="true">
          ✦
        </span>
        <span className="orbit-star star-two" aria-hidden="true">
          ✦
        </span>
        <span className="orbit-star star-three" aria-hidden="true">
          ✧
        </span>
        <span className="orbit-star star-four" aria-hidden="true">
          ✦
        </span>
        <div className={'avatar avatar-' + (profile.avatarFrame ?? 'plain')}>
          <SafeImage
            image={profile.avatar}
            fallback={
              <span aria-hidden="true">
                {profile.displayName ? Array.from(profile.displayName)[0] : '✦'}
              </span>
            }
            eager
          />
        </div>
        {profile.motto && <p className="hero-motto">{profile.motto}</p>}
      </div>
    </section>
  );
}
