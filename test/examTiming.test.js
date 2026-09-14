import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createExamClock, getPassingScore, getExamScore } from '../src/utils/examTiming.js';

test('suspended timers still record 30 minutes as 1800 seconds', () => {
  let now = 0;
  const clock = createExamClock(2700, () => now);
  now += 30 * 60 * 1000;
  assert.equal(clock.elapsed(), 1800);
  assert.equal(clock.remaining(), 900);
  clock.stop();
  now += 50000;
  assert.equal(clock.elapsed(), 1800, 'network save time is excluded');
});

test('expiration is clamped and a retry receives a fresh duration', () => {
  let now = 0;
  const first = createExamClock(60, () => now);
  now = 120000;
  assert.equal(first.remaining(), 0);
  assert.equal(first.elapsed(), 60);
  const retry = createExamClock(60, () => now);
  assert.equal(retry.remaining(), 60);
});

test('custom exam threshold and server score precision agree', () => {
  assert.equal(getExamScore(3, 4) >= getPassingScore({ passingScore: 80 }), false);
  assert.equal(getExamScore(3, 4) >= getPassingScore({ passingScore: 70 }), true);
  assert.equal(getExamScore(2, 3), 66.7);
  assert.equal(getExamScore(0, 0), 0);
  assert.equal(getPassingScore({ passingScore: 0 }), 0);
  for (const passingScore of [null, undefined, '', 'invalid']) {
    assert.equal(getPassingScore({ passingScore }), 70);
  }
});
