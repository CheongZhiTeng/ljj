import { ArrowUpRight, Camera } from 'lucide-react';
import type { SocialLink } from '../../types/profile';
import { usePreferences } from '../../contexts/preferences';

export function SocialLinks({ links }: { links: SocialLink[] }) {
  const { t } = usePreferences();
  return links.map((link) => (
    <a
      className="social-card panel"
      href={link.url}
      key={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        t('instagram') + ' · ' + link.label + ' @' + link.username + t('opens')
      }
    >
      <span className="social-icon">
        <Camera size={24} aria-hidden="true" />
      </span>
      <span>
        <strong>Instagram</strong>
        <span className="social-account">
          {link.label} <span>@{link.username}</span>
        </span>
      </span>
      <ArrowUpRight className="social-arrow" size={20} aria-hidden="true" />
    </a>
  ));
}
