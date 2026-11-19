import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  httpsUrl,
  isAssetPath,
  validateProfile,
} from '../src/config/validate.ts';
import { nextTrack, timeLabel } from '../src/utils/audio.ts';
import { quizScore } from '../src/utils/quiz.ts';

const baseline = () =>
  JSON.parse(
    readFileSync(
      new URL('../public/data/profile.json', import.meta.url),
      'utf8',
    ),
  );

test('valid profile supports missing optional fields and round-trips', () => {
  const profile = baseline();
  assert.deepEqual(
    validateProfile(JSON.parse(JSON.stringify(profile))),
    profile,
  );
  delete profile.profile.avatar;
  assert.doesNotThrow(() => validateProfile(profile));
});

test('unsafe links, traversal, invalid accounts, and unknown fields are rejected', () => {
  assert.equal(httpsUrl('javascript:alert(1)'), undefined);
  assert.equal(httpsUrl('https://name:secret@example.com'), undefined);
  assert.equal(isAssetPath('images/../private.png'), false);
  assert.equal(isAssetPath('music/licensed/song-1.mp3'), true);
  const profile = baseline();
  profile.socialMedia = [
    {
      platform: 'instagram',
      label: 'Test',
      username: 'test',
      url: 'https://instagram.com.example.org/test',
    },
  ];
  assert.throws(() => validateProfile(profile), /Instagram link/);
  delete profile.socialMedia[0];
  profile.socialMedia = [];
  profile.profile.privateAddress = 'fixture';
  assert.throws(() => validateProfile(profile), /unknown field/);
});

test('quiz validates choices and calculates mixed and empty scores', () => {
  const profile = baseline();
  profile.quiz = [
    { prompt: { zh: '测试' }, options: ['A', 'B', 'C', 'D'], answer: 2 },
  ];
  const { quiz } = validateProfile(profile);
  assert.equal(quizScore(quiz, []), 0);
  assert.equal(quizScore(quiz, [1]), 0);
  assert.equal(quizScore(quiz, [2, 0]), 1);
  profile.quiz[0].options[3] = 'A';
  assert.throws(() => validateProfile(profile), /distinct choices/);
});

test('track navigation wraps, shuffle avoids the active track, and time is readable', () => {
  assert.equal(nextTrack(0, 3, -1, false), 2);
  assert.equal(nextTrack(2, 3, 1, false), 0);
  assert.equal(
    nextTrack(1, 3, 1, true, () => 0),
    2,
  );
  assert.equal(
    nextTrack(1, 3, 1, true, () => 0.99),
    0,
  );
  assert.equal(timeLabel(125.8), '2:05');
  assert.equal(timeLabel(Infinity), '0:00');
});
