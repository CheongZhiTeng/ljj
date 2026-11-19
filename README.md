# Personal Social Hub

A static, bilingual social homepage built around the owner's questionnaire. The local review version includes a profile, Instagram, favorite things, music picks, and a short personal quiz. The design pairs a black and deep-blue sky with a square profile frame, star motifs, and a separate daylight palette.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open the localhost address printed by Vite. The personalized review profile is stored locally in `src/config/profile.local.json`. It is Git-ignored. Without that file, the app uses the safe template at `public/data/profile.json`.

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run preview
```

`npm run build` writes static files to `dist/`. If a review profile is present, the local build includes it. Keep that preview on your own machine until publication is approved. To run the Chromium tests after building, use `npm run test:browser` with Chromium installed. The default executable is `/usr/bin/chromium` and can be overridden with `CHROMIUM_PATH`. The browser suite starts local dev and static servers and uses synthetic WAV data in memory. It does not need a music service.

## Project structure

| Path                                  | Purpose                                                        |
| ------------------------------------- | -------------------------------------------------------------- |
| `src/components/`                     | Layout, profile, social, interests, music, quiz, and shared UI |
| `src/pages/`                          | Single-page section composition and visibility                 |
| `src/config/`, `src/types/`           | Profile validation, content loading, and type definitions      |
| `src/contexts/`, `src/hooks/`         | Theme and language preferences, audio lifecycle                |
| `src/i18n/messages.ts`, `src/styles/` | Interface translations and visual tokens                       |
| `src/editor/`                         | Development-only profile editor                                |
| `public/images/`, `public/music/`     | Static images and authorized media                             |
| `tests/`                              | Node and Chromium checks                                       |
| `.github/workflows/deploy.yml`        | Manual GitHub Pages build and deployment                       |

React and TypeScript run through Vite, with Tailwind CSS, Framer Motion, and Lucide icons. The player uses HTML media and Web Audio. Theme, language, and best quiz score use LocalStorage. ESLint and Prettier cover source checks, and Playwright Core drives Chromium tests.

## Edit the profile

1. Run the dev server and open **Edit profile** in the footer.
2. Select a configuration section or import a complete JSON file. The validator reports the path to invalid fields.
3. Choose **Apply preview** to see the changes in memory. To retain edits, use **Export JSON** and save the file as `src/config/profile.local.json`, then restart Vite. Exported drafts always have publication approval cleared.
4. Use `visibility` to control each section independently. Empty optional sections are hidden. Delete optional fields to omit them.

The current review uses the supplied nickname, alias, country, language, MBTI, site copy, and approved-for-sharing Instagram handle. The Instagram URL is derived from the handle. Quiz prompts and distractors are editorial additions based on questionnaire preferences. The review omits some optional answers and should be checked by the owner before any publication.

### Images

Put authorized images in `public/images/`. Set `profile.avatar`, `profile.banner`, or `website.previewImage` to objects such as `{ "src": "images/avatar.webp", "alt": { "zh": "头像", "en": "Profile avatar" } }`. Use a consistent, readable filename. The square avatar preserves the original aspect ratio. Banner images fill the hero panel and may crop at its edges. Animated GIF or WebP avatars can be referenced if approved. Provide a static image if motion must be avoided across browsers.

Use appropriately sized, optimized files and remove location and identifying metadata before copying them into `public/`. Placeholder artwork is made from site typography and CSS. The avatar initial and star field are used until the owner provides approved images.

### Music

`music.collection` contains favorite artists, tracks, albums, genres, and recommendations. Link a specific official release with an HTTPS `url` when one is available. Add playable entries to `music.playlist` with a unique `id`, `src`, `title`, and `artist`, plus optional `artwork` in the image format above. For background music, add the approved track first. Use licensed files in `public/music/` or authorized, direct HTTPS audio files. Official streaming page URLs belong in the collection as links.

Playback starts from an explicit visitor action. The owner’s default repeat and shuffle settings are off. A same-origin playlist uses genuine Web Audio frequency analysis. If the playlist can contain cross-origin tracks, it uses a CSS playing indicator to keep external audio playback independent of CORS and frequency analysis. Both respect reduced motion. The independent card follows the owner's placement preference. The current playlist is empty because no authorized audio, playable embed, or album artwork was supplied. The requested background track appears as a music pick only.

### Quiz, theme, and language

- Each quiz question requires `prompt.zh`, four distinct `options`, and a zero-based `answer` from 0 to 3. Add `prompt.en` for English. Use public preferences approved for the site. An empty quiz array removes the section.
- `theme.preference` accepts `dark`, `light`, or `system`. Adjust the corresponding colors in `src/styles/tokens.css`. The initial theme is applied before rendering.
- `localization.defaultLocale` accepts `zh` or `en`. Edit interface strings in `src/i18n/messages.ts`. Localized profile text can have `zh` and `en`; the app uses the available language as a fallback and preserves original names and titles.

## GitHub Pages and owner review

1. Have the owner review the local profile, artwork, music permissions, quiz, and share card. Review every file that would be copied to `dist/`, including static files under `public/`.
2. Copy only the approved version to `public/data/profile.json`. Set `website.canonicalUrl` to the final HTTPS address, including a trailing slash, and set `publicationApproved` to true. Add an approved `website.previewImage` if a social preview image is wanted. A local preview image is resolved against that canonical URL. Messaging and social platforms can cache previews.
3. Run `PAGES_DEPLOY=1 npm run build` and review the result. Release mode reads the approved public file and rejects an unapproved configuration or a missing canonical URL.
4. After publication approval, push the approved branch. Set **Settings → Pages → Source** to **GitHub Actions**, then manually run **Deploy to GitHub Pages**. Relative asset paths work at the repository subpath and at a custom-domain root. The single page uses fragment navigation, so direct section links and refresh use the same HTML entry point.

Keep raw questionnaires, unapproved photos, drafts, location metadata, and private details outside Git. Files in `public/` are served directly. Git history can retain anything previously committed. The site uses no analytics or visitor accounts. The local editor is removed from the release bundles and performs no remote writes.

## Content awaiting the owner

The questionnaire left the avatar, banner, bio, and long introduction blank. The layout supports these fields and omits the missing content. A share preview image, canonical URL, licensed audio or official playable source for the requested background track, and approved album art remain optional assets to supply before the corresponding content can appear.
