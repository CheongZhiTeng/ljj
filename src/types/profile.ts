export type ThemePreference = 'system' | 'light' | 'dark';
export type Locale = 'zh' | 'en';
export interface Localized {
  zh: string;
  en?: string;
}
export interface MediaAsset {
  src: string;
  alt: Localized;
}
export interface SocialLink {
  platform: 'instagram';
  label: string;
  username: string;
  url: string;
}
export interface AudioTrack {
  id: string;
  src: string;
  title: string;
  artist: string;
  artwork?: MediaAsset;
}
export interface MusicEntry {
  label: Localized;
  value: string;
  url?: string;
}
export interface QuizQuestion {
  prompt: Localized;
  options: [string, string, string, string];
  answer: number;
}
export interface InterestGroup {
  id: string;
  label: Localized;
  values: string[];
}
export interface ProfileConfig {
  website: {
    title: string;
    subtitle: Localized;
    welcome: Localized;
    description: Localized;
    canonicalUrl?: string;
    previewImage?: MediaAsset;
  };
  profile: {
    displayName: string;
    aliases: string[];
    bio?: Localized;
    about?: Localized;
    motto?: string;
    quote?: string;
    region?: Localized;
    languages: Localized[];
    mbti?: string;
    tags: string[];
    avatar?: MediaAsset;
    banner?: MediaAsset;
    avatarFrame?: 'plain' | 'outline';
  };
  socialMedia: SocialLink[];
  interests: InterestGroup[];
  personality: MusicEntry[];
  music: {
    collection: MusicEntry[];
    playlist: AudioTrack[];
    repeat: boolean;
    shuffle: boolean;
    visualization: boolean;
  };
  quiz: QuizQuestion[];
  theme: { preference: ThemePreference };
  localization: { defaultLocale: Locale };
  visibility: {
    about: boolean;
    interests: boolean;
    music: boolean;
    quiz: boolean;
    social: boolean;
  };
  publicationApproved: boolean;
}
