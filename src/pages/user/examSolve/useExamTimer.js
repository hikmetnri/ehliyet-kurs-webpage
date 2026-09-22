import { useEffect, useRef, useState } from 'react';
import { createExamClock } from '../../../utils/examTiming';

// ─── Timer Hook ──────────────────────────────────────────────────────────────
export const useTimer = (durationMinutes, onExpire, active = false) => {
  const durationSeconds = Math.max(1, durationMinutes || 45) * 60;
  const [remaining, setRemaining] = useState(durationSeconds);
  const clockRef = useRef(null);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (!active) return undefined;
    const clock = createExamClock(durationSeconds);
    clockRef.current = clock;
    const tick = () => {
      if (clock.stopped) return;
      const value = clock.remaining();
      setRemaining(value);
      if (value === 0) {
        clock.stop();
        clearInterval(intervalRef.current);
        onExpireRef.current?.();
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      clock.stop();
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [active, durationSeconds]);

  const stop = () => {
    clockRef.current?.stop();
    clearInterval(intervalRef.current);
    return clockRef.current?.elapsed() ?? 0;
  };

  const formatted = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  const pct = ((durationSeconds - remaining) / durationSeconds) * 100;
  const isWarning = remaining < 300; // < 5 min
  const isDanger = remaining < 60;

  return { formatted, pct, isWarning, isDanger, stop, remaining };
};
