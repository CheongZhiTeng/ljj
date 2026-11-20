import { Disc3, Contact, ScanLine, Boxes } from 'lucide-react';
import { usePreferences } from '../contexts/preferences';
import type { ProfileConfig } from '../types/profile';
import { Interests } from '../components/interests/Interests';
import {
  SiteLayout,
  type NavigationSection,
} from '../components/layout/SiteLayout';
import { MusicCollection } from '../components/music/MusicCollection';
import { Hero } from '../components/profile/Hero';
import { Quiz } from '../components/quiz/Quiz';
import { SocialLinks } from '../components/social/SocialLinks';
import { Section } from '../components/ui/Section';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export function HomePage({
  config,
  edit,
}: {
  config: ProfileConfig;
  edit?: () => void;
}) {
  const { t, localize } = usePreferences();
  const { profile, visibility, music, personality } = config;
  const about =
    visibility.about &&
    Boolean(localize(profile.about) || profile.quote || personality.length);
  const interests =
    visibility.interests &&
    config.interests.some((group) => group.values.length);
  const musicVisible =
    visibility.music &&
    Boolean(music.collection.length || music.playlist.length);
  const quiz = visibility.quiz && config.quiz.length > 0;
  const social = visibility.social && config.socialMedia.length > 0;
  const sections: NavigationSection[] = [];
  if (about) sections.push('about');
  if (interests) sections.push('interests');
  if (musicVisible) sections.push('music');
  if (quiz) sections.push('quiz');
  return (
    <SiteLayout title={config.website.title} sections={sections} editor={edit}>
      <ErrorBoundary message={t('error')} reload={t('reload')}>
        <Hero
          config={config}
          nextSection={sections[0] ?? (social ? 'social' : undefined)}
        />
        {social && (
          <div id="social" className="social-links">
            <SocialLinks links={config.socialMedia} />
          </div>
        )}
        {about && (
          <Section id="about" title={t('aboutTitle')} icon={Contact}>
            <div className="about-grid">
              {(profile.quote || localize(profile.about)) && (
                <div className="panel quote-card">
                  {profile.quote && <blockquote>{profile.quote}</blockquote>}
                  {localize(profile.about) && <p>{localize(profile.about)}</p>}
                </div>
              )}
              {personality.length > 0 && (
                <dl className="panel personality-list">
                  {personality.map((item, i) => (
                    <div key={i}>
                      <dt>{localize(item.label)}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </Section>
        )}
        {interests && (
          <Section id="interests" title={t('interestsTitle')} icon={Boxes}>
            <Interests groups={config.interests} />
          </Section>
        )}
        {musicVisible && (
          <Section id="music" title={t('musicTitle')} icon={Disc3}>
            <MusicCollection music={music} />
          </Section>
        )}
        {quiz && (
          <Section id="quiz" title={t('quizTitle')} icon={ScanLine}>
            <Quiz questions={config.quiz} key={JSON.stringify(config.quiz)} />
          </Section>
        )}
      </ErrorBoundary>
    </SiteLayout>
  );
}
