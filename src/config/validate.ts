import type { ProfileConfig } from '../types/profile.ts';

export function httpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      ? url
      : undefined;
  } catch {
    return undefined;
  }
}

export function isAssetPath(value: string) {
  return /^(images|music)\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(
    value,
  );
}

type Rule = (value: unknown, path: string) => void;
const fail = (path: string, expected: string): never => {
  throw new Error(path + ' · ' + expected);
};
const string: Rule = (v, p) => {
  if (typeof v !== 'string') fail(p, 'expected text');
};
const text: Rule = (v, p) => {
  if (typeof v !== 'string' || !v.trim()) fail(p, 'expected nonempty text');
};
const bool: Rule = (v, p) => {
  if (typeof v !== 'boolean') fail(p, 'expected true or false');
};
const optional =
  (rule: Rule): Rule =>
  (v, p) => {
    if (v !== undefined) rule(v, p);
  };
const oneOf =
  (...choices: readonly unknown[]): Rule =>
  (v, p) => {
    if (!choices.includes(v)) fail(p, 'allowed values: ' + choices.join(', '));
  };
const array =
  (rule: Rule, size?: number): Rule =>
  (v, p) => {
    if (!Array.isArray(v)) return fail(p, 'expected a list');
    if (size !== undefined && v.length !== size)
      fail(p, 'expected ' + size + ' entries');
    v.forEach((item: unknown, i) => rule(item, p + '[' + i + ']'));
  };
const object =
  (fields: Record<string, Rule>): Rule =>
  (v, p) => {
    if (!v || typeof v !== 'object' || Array.isArray(v))
      return fail(p, 'expected an object');
    const record = v as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (!Object.hasOwn(fields, key)) fail(p + '.' + key, 'unknown field');
    }
    for (const [key, rule] of Object.entries(fields))
      rule(record[key], p + '.' + key);
  };
const link: Rule = (v, p) => {
  if (typeof v !== 'string' || !httpsUrl(v))
    fail(p, 'expected a safe HTTPS URL');
};
const asset: Rule = (v, p) => {
  if (typeof v !== 'string' || (!isAssetPath(v) && !httpsUrl(v)))
    fail(p, 'expected an images/ or music/ path, or HTTPS URL');
};
const slug: Rule = (v, p) => {
  if (typeof v !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(v))
    fail(p, 'expected a simple ID');
};
const localized = object({ zh: string, en: optional(string) });
const image = object({ src: asset, alt: localized });
const entry = object({ label: localized, value: text, url: optional(link) });
const schema = object({
  website: object({
    title: text,
    subtitle: localized,
    welcome: localized,
    description: localized,
    canonicalUrl: optional(link),
    previewImage: optional(image),
  }),
  profile: object({
    displayName: string,
    aliases: array(text),
    bio: optional(localized),
    about: optional(localized),
    motto: optional(text),
    quote: optional(text),
    region: optional(localized),
    languages: array(localized),
    mbti: optional(text),
    tags: array(text),
    avatar: optional(image),
    banner: optional(image),
    avatarFrame: optional(oneOf('plain', 'outline')),
  }),
  socialMedia: array(
    object({
      platform: oneOf('instagram'),
      label: text,
      username: text,
      url: link,
    }),
  ),
  interests: array(object({ id: slug, label: localized, values: array(text) })),
  personality: array(entry),
  music: object({
    collection: array(entry),
    playlist: array(
      object({
        id: slug,
        src: asset,
        title: text,
        artist: text,
        artwork: optional(image),
      }),
    ),
    repeat: bool,
    shuffle: bool,
    visualization: bool,
  }),
  quiz: array(
    object({
      prompt: localized,
      options: array(text, 4),
      answer: oneOf(0, 1, 2, 3),
    }),
  ),
  theme: object({ preference: oneOf('system', 'light', 'dark') }),
  localization: object({ defaultLocale: oneOf('zh', 'en') }),
  visibility: object({
    about: bool,
    interests: bool,
    music: bool,
    quiz: bool,
    social: bool,
  }),
  publicationApproved: bool,
});

export function validateProfile(value: unknown): ProfileConfig {
  schema(value, 'profile');
  const profile = value as ProfileConfig;
  for (const [entries, path] of [
    [profile.interests, 'interests'],
    [profile.music.playlist, 'music.playlist'],
  ] as const) {
    if (new Set(entries.map(({ id }) => id)).size !== entries.length)
      fail(path, 'IDs must be unique');
  }
  for (const social of profile.socialMedia) {
    const url = httpsUrl(social.url);
    if (
      !/^[\w.]{1,30}$/.test(social.username) ||
      !url ||
      !['www.instagram.com', 'instagram.com'].includes(url.host) ||
      !['/' + social.username, '/' + social.username + '/'].includes(
        url.pathname,
      )
    ) {
      fail('socialMedia', 'Instagram link must match the account username');
    }
  }
  for (const question of profile.quiz) {
    if (
      !question.prompt.zh.trim() ||
      new Set(question.options.map((option) => option.trim().toLowerCase()))
        .size !== 4
    ) {
      fail('quiz', 'each question needs a prompt and four distinct choices');
    }
  }
  if (profile.website.canonicalUrl) {
    const url = httpsUrl(profile.website.canonicalUrl)!;
    if (url.search || url.hash || !url.pathname.endsWith('/'))
      fail('website.canonicalUrl', 'expected a site URL ending in /');
  }
  return profile;
}
