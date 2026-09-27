import { useState } from 'react';
import { useProgress, setDone } from '@/lib/progress';
import { prevStepId } from '@/lib/lessons';

export type Question = { q: string; options: string[]; answer: number; why: string };

// A short quiz. All correct -> the lesson's "check" step is marked done.
export default function Check({ id, questions }: { id: string; questions: Question[] }) {
  const state = useProgress();
  const [picked, setPicked] = useState<(number | null)[]>(questions.map(() => null));
  const correct = picked.filter((p, i) => p === questions[i].answer).length;
  const allRight = correct === questions.length;
  const pick = (qi: number, oi: number) => {
    const next = [...picked]; next[qi] = oi; setPicked(next);
    if (next.every((p, i) => p === questions[i].answer)) setDone(id, true);
  };
  const prev = prevStepId(id);
  if (prev && !state[prev]) return (
    <div className="rounded-xl border border-line bg-paper p-5 flex items-center gap-4 text-ink-3">
      <span className="w-6 h-6 rounded-full bg-line grid place-items-center text-xs shrink-0" aria-hidden><svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg></span>
      <span className="text-sm">Locked. Mark the step above done to open the check.</span>
    </div>
  );
  return (
    <div className="rounded-xl border border-line bg-white p-5 space-y-6">
      {questions.map((q, qi) => {
        const p = picked[qi];
        return (
          <div key={qi}>
            <p className="font-medium mb-2"><span className="font-mono text-ink-3 text-xs mr-2">Q{qi + 1}</span>{q.q}</p>
            <div className="grid gap-1.5">
              {q.options.map((o, oi) => {
                const chosen = p === oi;
                const right = oi === q.answer;
                const cls = p === null ? 'border-line hover:border-ink-3' : chosen && right ? 'border-ok bg-ok-soft' : chosen ? 'border-bad bg-bad-soft' : p !== null && right ? 'border-ok/50' : 'border-line opacity-60';
                return (
                  <button key={oi} onClick={() => pick(qi, oi)} className={`text-left text-sm rounded-lg border px-3 py-2 transition-colors ${cls}`}>{o}</button>
                );
              })}
            </div>
            {p !== null && <p className={`text-sm mt-2 ${p === q.answer ? 'text-ok' : 'text-bad'}`}>{p === q.answer ? 'Right. ' : 'Not quite. '}<span className="text-ink-2">{q.why}</span></p>}
          </div>
        );
      })}
      <div className={`rounded-lg px-3 py-2 text-sm font-mono ${allRight || state[id] ? 'bg-ok-soft text-ok' : 'bg-paper text-ink-3'}`}>
        {allRight || state[id] ? '✓ Check passed. Step marked done.' : `${correct} of ${questions.length} correct`}
      </div>
    </div>
  );
}
