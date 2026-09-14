export function getPassingScore(exam) {
  const value = exam?.passingScore;
  const score = Number(value);
  return value != null && value !== '' && Number.isFinite(score) ? score : 70;
}

export function getExamScore(correct, total) {
  return total > 0 ? Number(((correct / total) * 100).toFixed(1)) : 0;
}

// A deadline keeps elapsed time correct even when browser timers are suspended.
export function createExamClock(durationSeconds, now = Date.now) {
  const startedAt = now();
  let stoppedAt = null;
  const elapsed = () => Math.min(durationSeconds, Math.max(0,
    Math.floor(((stoppedAt ?? now()) - startedAt) / 1000)));
  return {
    elapsed,
    remaining: () => durationSeconds - elapsed(),
    stop: () => { stoppedAt ??= now(); },
    get stopped() { return stoppedAt !== null; },
  };
}
