import { useEffect, useRef, useState } from 'react';
import { LESSONS, stepId, lessonBlocker } from '@/lib/lessons';
import { useProgress, resetAll } from '@/lib/progress';

const tone: Record<string, string> = {
  setup: 'bg-setup', skill: 'bg-skill', agent: 'bg-agent', team: 'bg-team', vault: 'bg-vault',
};

// Two-step reset: the first click arms it, the second clears. Disarms after 4s.
function ResetButton({ disabled }: { disabled: boolean }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (disabled) {
    return <span className="text-[11px] font-mono text-ink-3/60">nothing to reset</span>;
  }
  return (
    <button
      onClick={() => {
        clearTimeout(timer.current);
        if (armed) { resetAll(); setArmed(false); return; }
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 4000);
      }}
      className={`rounded-md border px-2 py-1 text-[11px] font-mono transition-colors ${
        armed ? 'border-bad bg-bad-soft text-bad font-medium' : 'border-line-2 bg-white text-ink-2 hover:border-ink-3 hover:text-ink'
      }`}
    >
      {armed ? 'click again to clear' : 'reset progress'}
    </button>
  );
}

export default function ProgressNav({ current }: { current: string }) {
  const state = useProgress();
  const all = LESSONS.flatMap((l) => l.steps.map((s) => stepId(l.slug, s)));
  const total = all.length;
  const done = all.filter((id) => state[id]).length;
  return (
    <nav className="px-3 pb-6">
      <div className="px-2 mb-3">
        <div className="flex justify-between text-xs font-mono text-ink-3 mb-1"><span>overall</span><span>{done} / {total}</span></div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden"><div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} /></div>
        <div className="mt-2.5 flex justify-end"><ResetButton disabled={done === 0} /></div>
      </div>
      <ul className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-0.5 lg:pb-0">
        {LESSONS.map((l) => {
          const ids = l.steps.map((s) => stepId(l.slug, s));
          const n = ids.filter((id) => state[id]).length;
          const complete = n === ids.length;
          const active = l.slug === current;
          const locked = !!lessonBlocker(l.slug, state);
          const inner = (
            <>
              <span className={`w-2 h-2 rounded-full shrink-0 ${complete ? 'bg-ok' : locked ? 'bg-line-2' : tone[l.tone]} ${complete ? '' : 'opacity-70'}`} />
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-3">{l.kicker}</span>
                <span className={`block font-medium truncate ${locked ? 'text-ink-3' : ''}`}>{l.title}</span>
              </span>
              {locked
                ? <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-ink-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="locked"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>
                : <span className={`font-mono text-xs ${complete ? 'text-ok' : 'text-ink-3'}`}>{complete ? '✓' : `${n}/${ids.length}`}</span>}
            </>
          );
          const cls = `flex items-center gap-3 rounded-lg px-2 py-2 text-sm ${active ? 'bg-white shadow-sm border border-line' : locked ? '' : 'hover:bg-white/70'}`;
          return (
            <li key={l.slug} className="shrink-0 min-w-[150px] lg:min-w-0">
              {locked && !active
                ? <span className={`${cls} cursor-not-allowed`} title="Finish the lessons above first" aria-disabled="true">{inner}</span>
                : <a href={l.href} className={cls}>{inner}</a>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
