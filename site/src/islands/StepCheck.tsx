import type { ReactNode } from 'react';
import { useProgress, setDone } from '@/lib/progress';
import { prevStepId } from '@/lib/lessons';

// One step. The body is static HTML passed in as children. A step stays locked,
// with its body hidden, until the step before it in the same lesson is marked done.
export default function StepCheck({ id, n, title, kicker, bare, children }: { id: string; n: number; title: string; kicker?: string; bare?: boolean; children?: ReactNode }) {
  const state = useProgress();
  const done = !!state[id];
  const prev = prevStepId(id);
  const locked = !!prev && !state[prev];

  const button = locked ? null : done ? (
    <span className="flex items-center gap-3 shrink-0">
      <span className="text-ok text-sm font-medium">✓ Done</span>
      <button onClick={() => setDone(id, false)} className="text-xs text-ink-3 underline underline-offset-2 hover:text-ink-2">Undo</button>
    </span>
  ) : (
    <button onClick={() => setDone(id, true)} className="shrink-0 rounded-lg bg-[#1f7a3f] hover:bg-[#19652f] text-white text-sm font-medium px-4 py-2 transition-colors" aria-label={`Mark step ${n} done`}>
      Mark done
    </button>
  );

  return (
    <section id={id.split(':')[1]} className={`relative rounded-xl border transition-colors ${locked ? 'bg-paper border-line' : done ? 'bg-white border-ok/50' : 'bg-white border-line'}`}>
      <div className={`flex items-start gap-4 ${bare ? 'px-5 py-3.5' : 'p-5'}`}>
        <span className={`mt-0.5 w-6 h-6 rounded-full shrink-0 grid place-items-center text-xs ${locked ? 'bg-line text-ink-3' : done ? 'bg-ok text-white' : 'border-2 border-line-2'}`} aria-hidden>
          {locked ? <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg> : done ? '✓' : ''}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[11px] font-mono uppercase tracking-wider text-ink-3">{kicker ?? `Step ${n}`}</span>
          <span className={`block font-semibold leading-snug ${bare ? 'text-base' : 'text-lg'} ${locked ? 'text-ink-3' : done ? 'text-ink-2' : ''}`}>{title}</span>
          {locked && <span className="block text-sm text-ink-3 mt-1">Locked. Mark the step above done to open this one.</span>}
        </span>
        {bare && button}
      </div>
      {!bare && !locked && (
        <>
          <div className="px-5 pl-[3.75rem] prose-lesson text-[15px]">{children}</div>
          <div className="flex justify-end px-5 pb-5 pt-4">{button}</div>
        </>
      )}
    </section>
  );
}
