import { useProgress } from '@/lib/progress';
import { LESSONS, lessonBlocker, stepId } from '@/lib/lessons';

const tone: Record<string, string> = { setup: 'border-l-setup', skill: 'border-l-skill', agent: 'border-l-agent', team: 'border-l-team', vault: 'border-l-vault' };

// The lesson list on the home page, with locks that match the sidebar.
export default function PathList() {
  const state = useProgress();
  return (
    <ol className="grid gap-3 mb-14">
      {LESSONS.map((l) => {
        const locked = !!lessonBlocker(l.slug, state);
        const n = l.steps.filter((s) => state[stepId(l.slug, s)]).length;
        const body = (
          <>
            <span className="font-mono text-xs text-ink-3 w-16 shrink-0">{l.kicker}</span>
            <span className="flex-1"><span className="block font-semibold">{l.title}</span><span className="text-sm text-ink-2">{locked ? 'Locked · finish the lesson above first' : n ? `${n} of ${l.steps.length} steps done` : `${l.steps.length} steps`}</span></span>
            <span className={n === l.steps.length ? 'text-ok' : 'text-ink-3'}>{locked ? <svg viewBox="0 0 16 16" className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="1.6" aria-label="locked"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg> : n === l.steps.length ? '✓' : '→'}</span>
          </>
        );
        const cls = `flex items-baseline gap-4 rounded-xl border-l-4 border border-line p-4 ${tone[l.tone]}`;
        return (
          <li key={l.slug}>
            {locked
              ? <span className={`${cls} bg-paper opacity-70 cursor-not-allowed`} aria-disabled="true">{body}</span>
              : <a href={l.href} className={`${cls} bg-white hover:shadow-sm`}>{body}</a>}
          </li>
        );
      })}
    </ol>
  );
}
