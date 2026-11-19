import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { resolve, sep } from 'node:path';
import { test, before, after } from 'node:test';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const testPort = 5192;
const origin = 'http://127.0.0.1:' + testPort;
const baseline = JSON.parse(await readFile('public/data/profile.json', 'utf8'));
const fixture = {
  ...baseline,
  publicationApproved: false,
  website: { ...baseline.website, title: 'Test Hub' },
  profile: {
    displayName: 'Test Profile',
    aliases: ['Alias'],
    languages: [{ zh: '华文', en: 'Chinese' }],
    tags: [],
    region: { zh: '地区', en: 'Region' },
    avatar: { src: 'images/missing.png', alt: { zh: '头像', en: 'Avatar' } },
  },
  socialMedia: [
    {
      platform: 'instagram',
      label: 'Test profile',
      username: 'test',
      url: 'https://www.instagram.com/test/',
    },
  ],
  interests: [
    { id: 'books', label: { zh: '书籍', en: 'Books' }, values: ['Test book'] },
  ],
  quiz: [
    {
      prompt: { zh: '第一题', en: 'First question' },
      options: ['One', 'Two', 'Three', 'Four'],
      answer: 1,
    },
    {
      prompt: { zh: '第二题', en: 'Second question' },
      options: ['Red', 'Blue', 'Green', 'White'],
      answer: 2,
    },
  ],
  music: {
    ...baseline.music,
    playlist: [
      {
        id: 'test-1',
        title: 'Test track one',
        artist: 'Oscillator',
        src: 'music/test-one.wav',
      },
      {
        id: 'test-2',
        title: 'Test track two',
        artist: 'Oscillator',
        src: 'music/test-two.wav',
      },
      {
        id: 'test-3',
        title: 'Test unavailable track',
        artist: 'Oscillator',
        src: 'music/test-error.wav',
      },
    ],
  },
};
let browser;
let dev;
let production;
let productionUrl;

before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  dev = await createServer({
    server: { host: '127.0.0.1', port: testPort, strictPort: true },
  });
  await dev.listen();
  const root = resolve('dist');
  const types = {
    html: 'text/html',
    js: 'text/javascript',
    css: 'text/css',
    svg: 'image/svg+xml',
    json: 'application/json',
  };
  production = createHttpServer(async (request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname;
    const relative = path.slice('/Profile-LJJ/'.length) || 'index.html';
    const file = resolve(root, relative);
    try {
      if (!path.startsWith('/Profile-LJJ/') || !file.startsWith(root + sep))
        throw new Error('Outside test mount');
      const data = await readFile(file);
      response.writeHead(200, {
        'Content-Type':
          types[file.split('.').at(-1)] || 'application/octet-stream',
      });
      response.end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
  production.listen(0, '127.0.0.1');
  await once(production, 'listening');
  productionUrl =
    'http://127.0.0.1:' + production.address().port + '/Profile-LJJ/';
});

after(async () => {
  await browser?.close();
  await dev?.close();
  if (production)
    await new Promise((resolveClose) => production.close(resolveClose));
});

const check = async (locator, timeout = 4500) =>
  locator.waitFor({ state: 'visible', timeout });
async function english(page) {
  const englishButton = page.getByRole('button', { name: /English/ });
  if (await englishButton.isVisible()) await englishButton.click();
}
async function editor(page) {
  await page.getByRole('button', { name: 'Edit profile' }).click();
  const dialog = page.getByRole('dialog');
  await check(dialog);
  return dialog;
}
async function importFixture(dialog, content = fixture) {
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'fixture.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(content)),
  });
  await check(dialog.getByText('Imported into the editor.', { exact: false }));
}

test('development profile, missing-image fallback, links, quiz, preferences, menu, and sharing', async () => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 820 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/images/missing.png', (route) =>
      route.fulfill({ status: 404 }),
    );
    await page.goto(origin);
    await english(page);
    await page
      .getByRole('combobox', { name: 'Appearance' })
      .selectOption('light');
    assert.equal(
      await page.locator('html').getAttribute('data-theme'),
      'light',
    );
    await page.reload();
    await check(page.getByRole('button', { name: /华文/ }));
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(
      await page.locator('html').getAttribute('data-theme'),
      'light',
    );
    await page
      .getByRole('combobox', { name: 'Appearance' })
      .selectOption('system');
    await page.emulateMedia({ colorScheme: 'light' });
    assert.equal(
      await page
        .locator('html')
        .evaluate((el) => getComputedStyle(el).colorScheme),
      'light',
    );
    await page.emulateMedia({ colorScheme: 'dark' });
    assert.equal(
      await page
        .locator('html')
        .evaluate((el) => getComputedStyle(el).colorScheme),
      'dark',
    );

    const dialog = await editor(page);
    await importFixture(dialog);
    await dialog.getByRole('button', { name: 'Validate' }).click();
    await check(dialog.getByText('Configuration is valid.'));
    const downloadReady = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Export JSON' }).click();
    const download = await downloadReady;
    assert.equal(download.suggestedFilename(), 'profile.local.json');
    const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
    assert.deepEqual(exported, fixture);
    await dialog.getByRole('button', { name: 'Apply preview' }).click();
    await check(page.getByRole('heading', { level: 1, name: 'Test Profile' }));
    await check(page.locator('.avatar').getByText('T'));
    assert.equal(
      await page
        .getByRole('link', { name: /Find me on Instagram/ })
        .getAttribute('href'),
      fixture.socialMedia[0].url,
    );
    await check(page.getByText('Test book'));
    assert.equal(
      await page
        .getByRole('heading', { name: 'About me', exact: true })
        .count(),
      0,
    );

    await page.getByRole('button', { name: 'Open menu' }).click();
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Quiz' })
      .click();
    assert.equal(
      await page
        .getByRole('button', { name: 'Open menu' })
        .getAttribute('aria-expanded'),
      'false',
    );
    await page.getByRole('button', { name: 'Start quiz' }).click();
    await page.getByRole('button', { name: /B Two/ }).click();
    await check(page.getByText('Correct!', { exact: true }));
    await page.getByRole('button', { name: 'Next question' }).click();
    await page.getByRole('button', { name: /A Red/ }).click();
    await check(page.getByText('Correct answer · Green'));
    await page.getByRole('button', { name: 'See results' }).click();
    await check(page.getByRole('heading', { name: 'Your score · 1/2' }));
    assert.ok(
      await page.evaluate(() =>
        Object.keys(localStorage).some(
          (key) =>
            key.startsWith('hub-quiz-') && localStorage.getItem(key) === '1',
        ),
      ),
    );
    await page.getByRole('button', { name: 'Play again' }).click();
    await check(page.getByRole('heading', { name: 'First question' }));

    await page.getByRole('button', { name: 'Copy link' }).click();
    await check(page.getByText('Link copied', { exact: true }));
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      origin + '/',
    );
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (data) => {
          window.testShare = data;
        },
      });
    });
    await page.getByRole('button', { name: 'Share profile' }).click();
    assert.deepEqual(await page.evaluate(() => window.testShare), {
      title: 'Test Hub',
      url: origin + '/',
    });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

function wav() {
  const rate = 8000;
  const count = rate * 18;
  const out = Buffer.alloc(44 + count * 2);
  out.write('RIFF');
  out.writeUInt32LE(out.length - 8, 4);
  out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24);
  out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++)
    out.writeInt16LE(
      Math.round(2000 * Math.sin((i * Math.PI * 2 * 440) / rate)),
      44 + i * 2,
    );
  return out;
}

test('actual audio playback, volume, seeking, visualization, playlist, and errors', async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
  try {
    const sound = wav();
    await page.route('**/music/test-*.wav', async (route) => {
      if (route.request().url().endsWith('test-error.wav'))
        return route.fulfill({ status: 404 });
      const range = route
        .request()
        .headers()
        .range?.match(/^bytes=(\d+)-(\d*)$/);
      if (!range)
        return route.fulfill({ body: sound, contentType: 'audio/wav' });
      const start = Number(range[1]);
      const end = range[2] ? Number(range[2]) : sound.length - 1;
      return route.fulfill({
        status: 206,
        contentType: 'audio/wav',
        headers: {
          'accept-ranges': 'bytes',
          'content-range': 'bytes ' + start + '-' + end + '/' + sound.length,
        },
        body: sound.subarray(start, end + 1),
      });
    });
    await page.goto(origin);
    await english(page);
    const dialog = await editor(page);
    await importFixture(dialog);
    await dialog.getByRole('button', { name: 'Apply preview' }).click();
    const audio = page.locator('audio');
    await audio.waitFor({ state: 'attached' });
    assert.equal(await audio.count(), 1);
    assert.equal(await audio.getAttribute('src'), null);
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector('audio').currentTime > 0.15,
    );
    await check(page.locator('canvas.visualizer'));
    await page.waitForFunction(
      () =>
        document
          .querySelector('canvas.visualizer')
          .getContext('2d')
          .getImageData(0, 0, 220, 28)
          .data.some((value, index) => index % 4 === 3 && value > 0),
      undefined,
      { timeout: 4500 },
    );
    await page.getByRole('button', { name: 'Mute', exact: true }).click();
    assert.equal(await audio.evaluate((el) => el.muted), true);
    await page.getByRole('button', { name: 'Unmute', exact: true }).click();
    await page.getByRole('slider', { name: 'Volume' }).focus();
    await page.keyboard.press('Home');
    assert.equal(await audio.evaluate((el) => el.volume), 0);
    const seek = page.getByRole('slider', { name: 'Playback position' });
    await seek.scrollIntoViewIfNeeded();
    const bounds = await seek.boundingBox();
    await seek.click({
      position: { x: bounds.width / 2, y: bounds.height / 2 },
    });
    await page.waitForFunction(
      () => {
        const element = document.querySelector('audio');
        return element.currentTime >= 7 && element.currentTime <= 11;
      },
      undefined,
      { timeout: 4500 },
    );
    await page.getByRole('button', { name: 'Next track', exact: true }).click();
    await check(
      page.getByRole('heading', {
        name: 'Test track two',
      }),
    );
    await page
      .getByRole('button', { name: /Test track one Oscillator/ })
      .click();
    await check(page.getByRole('button', { name: 'Pause', exact: true }));
    await page.getByRole('button', { name: 'Repeat track' }).click();
    assert.equal(await audio.evaluate((el) => el.loop), true);
    await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
    assert.equal(
      await page
        .getByRole('button', { name: 'Shuffle', exact: true })
        .getAttribute('aria-pressed'),
      'true',
    );
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    assert.equal(await audio.evaluate((el) => el.paused), true);
    await page
      .getByRole('button', { name: /Test unavailable track Oscillator/ })
      .click();
    await check(
      page.getByText('This track could not play. Try another track.'),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
  } finally {
    await page.close();
  }
});

test('production assets, metadata, responsive rendering, direct refresh, and editor exclusion', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const failures = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(response.url());
  });
  try {
    await page.goto(productionUrl);
    await check(page.getByRole('heading', { level: 1 }));
    assert.equal(
      await page.locator('meta[property="og:title"]').getAttribute('content'),
      await page.title(),
    );
    await english(page);
    assert.equal(
      await page.getByRole('button', { name: 'Edit profile' }).count(),
      0,
    );
    assert.equal(
      (await page.request.get(productionUrl + 'favicon.svg')).status(),
      200,
    );
    assert.equal(
      (await page.request.get(productionUrl + 'data/profile.json')).status(),
      200,
    );
    const anchor =
      (await page
        .locator('main section[id]')
        .evaluateAll((items) => items[0]?.id)) || 'main-content';
    await page.goto(productionUrl + '#' + anchor);
    await page.reload();
    await check(page.getByRole('heading', { level: 1 }));
    await page.goto(productionUrl);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 920 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      if (process.env.BROWSER_SCREENSHOTS && [390, 1440].includes(width)) {
        await mkdir(process.env.BROWSER_SCREENSHOTS, { recursive: true });
        await page.screenshot({
          path: process.env.BROWSER_SCREENSHOTS + '/' + width + '.png',
          fullPage: true,
        });
      }
    }
    assert.deepEqual(failures, []);
  } finally {
    await page.close();
  }
});
