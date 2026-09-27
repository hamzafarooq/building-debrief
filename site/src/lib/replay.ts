// Shared playback engine for the replay islands. A script is a list of events;
// the hook plays them in order, honouring speed, skip (instant) and reset.
import { useCallback, useRef, useState } from 'react';

export type Ev<T> = T & { ms?: number };

export function useReplay<T>(script: Ev<T>[], apply: (ev: T) => void, reset: () => void) {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [speed, setSpeed] = useState(1);
  const run = useRef(0);
  const instant = useRef(false);
  const speedRef = useRef(1);
  speedRef.current = speed;

  const play = useCallback(async (skip = false) => {
    const id = ++run.current;
    instant.current = skip;
    reset();
    setStatus('running');
    for (const ev of script) {
      if (run.current !== id) return;
      apply(ev);
      if (!instant.current && ev.ms) {
        await new Promise((r) => setTimeout(r, ev.ms! / speedRef.current));
      }
    }
    if (run.current === id) { setStatus('done'); instant.current = false; }
  }, [script, apply, reset]);

  const skip = useCallback(() => { if (status === 'running') instant.current = true; else play(true); }, [status, play]);
  const stop = useCallback(() => { run.current++; reset(); setStatus('idle'); }, [reset]);
  return { status, speed, setSpeed, play, skip, stop };
}
