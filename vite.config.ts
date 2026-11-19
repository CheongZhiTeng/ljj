import { existsSync, readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { validateProfile } from './src/config/validate.ts';

const local = new URL('./src/config/profile.local.json', import.meta.url);
const published = new URL('./public/data/profile.json', import.meta.url);
const virtualId = '\0virtual:profile';

function profilePlugin(): Plugin {
  const deploying = process.env.PAGES_DEPLOY === '1';
  const selected = !deploying && existsSync(local) ? local : published;
  const profile = validateProfile(JSON.parse(readFileSync(selected, 'utf8')));
  const site = profile.website;
  if (deploying && (!profile.publicationApproved || !site.canonicalUrl)) {
    throw new Error(
      'Pages deployment requires an approved profile and website.canonicalUrl in public/data/profile.json.',
    );
  }
  return {
    name: 'site-profile',
    resolveId(id) {
      if (id === 'virtual:profile') return virtualId;
    },
    load(id) {
      if (id === virtualId) return 'export default ' + JSON.stringify(profile);
    },
    transformIndexHtml(html) {
      const locale = profile.localization.defaultLocale;
      const description = site.description[locale] || site.description.zh;
      const tags = [
        { tag: 'meta', attrs: { name: 'description', content: description } },
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
        { tag: 'meta', attrs: { property: 'og:title', content: site.title } },
        {
          tag: 'meta',
          attrs: { property: 'og:description', content: description },
        },
      ];
      if (site.canonicalUrl) {
        tags.push({
          tag: 'meta',
          attrs: { property: 'og:url', content: site.canonicalUrl },
        });
      }
      if (site.previewImage && site.canonicalUrl) {
        tags.push({
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: new URL(site.previewImage.src, site.canonicalUrl).href,
          },
        });
        tags.push({
          tag: 'meta',
          attrs: {
            property: 'og:image:alt',
            content: site.previewImage.alt[locale] || site.previewImage.alt.zh,
          },
        });
      }
      return {
        html: html.replace(
          '<html lang="zh-Hans">',
          locale === 'en' ? '<html lang="en">' : '<html lang="zh-Hans">',
        ),
        tags: [
          ...tags,
          ...(site.canonicalUrl
            ? [
                {
                  tag: 'link',
                  attrs: { rel: 'canonical', href: site.canonicalUrl },
                },
              ]
            : []),
          {
            tag: 'title',
            children: site.title
              .replaceAll('&', '&amp;')
              .replaceAll('<', '&lt;'),
          },
          {
            tag: 'script',
            injectTo: 'head-prepend',
            children: `
          (() => {
            let theme = ${JSON.stringify(profile.theme.preference)};
            let lang = ${JSON.stringify(locale)};
            try {
              const savedTheme = localStorage.getItem('hub-theme');
              const savedLocale = localStorage.getItem('hub-locale');
              if (['light', 'dark', 'system'].includes(savedTheme)) theme = savedTheme;
              if (['zh', 'en'].includes(savedLocale)) lang = savedLocale;
            } catch {}
            document.documentElement.dataset.theme = theme === 'light' || theme === 'dark' ? theme : 'system';
            document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hans';
          })();
        `,
          },
        ],
      };
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [profilePlugin(), react(), tailwindcss()],
});
