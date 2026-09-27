import { useCallback, useEffect, useRef, useState } from 'react';
import { useReplay } from '@/lib/replay';

// Scripted replay of the two teammates agreeing coverage: slot lists, two rules, messages.
export type TeamEvent =
  | { type: 'lead'; text: string; ms?: number }
  | { type: 'msg'; who: string; side: 'q' | 'f' | 'lead'; text: string; ms?: number }
  | { type: 'list'; key: 'quiz' | 'flash'; items: string[]; ms?: number }
  | { type: 'mark'; key: 'quiz' | 'flash'; term: string; cls: 'bad' | 'new'; ms?: number }
  | { type: 'missing'; key: 'quiz' | 'flash'; items: string[]; ms?: number }
  | { type: 'rule'; n: 1 | 2; state: 'pass' | 'fail'; why: string; ms?: number };

type State = {
  lead: string[];
  msgs: { who: string; side: string; text: string }[];
  lists: Record<string, { term: string; cls?: string }[]>;
  rules: Record<number, { state: string; why: string }>;
};
const blank = (): State => ({ lead: [], msgs: [], lists: { quiz: [], flash: [] }, rules: {} });
const RULES = ['If the quiz tests a term, a card defines it.', 'If a card defines a term, something in the kit uses it.'];

export default function TeamReplay({ script }: { script: TeamEvent[] }) {
  const [s, setS] = useState<State>(blank);
  const box = useRef<HTMLDivElement>(null);
  const term = useRef<HTMLDivElement>(null);
  const apply = useCallback((ev: TeamEvent) => setS((p) => {
    const n: State = { lead: [...p.lead], msgs: [...p.msgs], lists: { quiz: [...p.lists.quiz], flash: [...p.lists.flash] }, rules: { ...p.rules } };
    if (ev.type === 'lead') n.lead.push(ev.text);
    else if (ev.type === 'msg') n.msgs.push({ who: ev.who, side: ev.side, text: ev.text });
    else if (ev.type === 'list') n.lists[ev.key] = ev.items.map((term) => ({ term }));
    else if (ev.type === 'mark') n.lists[ev.key] = n.lists[ev.key].map((x) => (x.term === ev.term ? { ...x, cls: ev.cls } : x));
    else if (ev.type === 'missing') n.lists[ev.key] = [...n.lists[ev.key], ...ev.items.map((term) => ({ term, cls: 'miss' }))];
    else if (ev.type === 'rule') n.rules[ev.n] = { state: ev.state, why: ev.why };
    return n;
  }), []);
  const reset = useCallback(() => setS(blank()), []);
  const { status, speed, setSpeed, play, skip, stop } = useReplay(script, apply, reset);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [s.msgs.length]);
  useEffect(() => { if (term.current) term.current.scrollTop = term.current.scrollHeight; }, [s.lead.length]);

  const chip = (x: { term: string; cls?: string }) => {
    const c = x.cls === 'bad' ? 'border-bad text-bad bg-bad-soft line-through' : x.cls === 'new' ? 'border-ok text-ok bg-ok-soft' : x.cls === 'miss' ? 'border-bad text-bad border-dashed' : 'border-line-2 bg-white';
    return <li key={x.term + x.cls} className={`text-[11px] rounded-full border px-2 py-0.5 transition-colors ${c}`}>{x.cls === 'miss' ? `${x.term}?` : x.term}</li>;
  };
  const count = (k: 'quiz' | 'flash') => s.lists[k].filter((x) => x.cls !== 'miss').length;

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button onClick={() => play()} disabled={status === 'running'} className="rounded-lg bg-ink text-paper px-3 py-1.5 text-sm font-medium disabled:opacity-50">▶ Play</button>
        <button onClick={skip} className="rounded-lg border border-line-2 px-3 py-1.5 text-sm">Skip to end</button>
        <button onClick={stop} className="rounded-lg border border-line-2 px-3 py-1.5 text-sm">Reset</button>
        <span className="inline-flex rounded-lg border border-line-2 overflow-hidden text-xs">
          {[1, 2, 4].map((x) => <button key={x} onClick={() => setSpeed(x)} className={`px-2.5 py-1.5 ${speed === x ? 'bg-ink text-paper' : ''}`}>{x}×</button>)}
        </span>
        <span className="font-mono text-xs text-ink-3 ml-auto">{status}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl overflow-hidden border border-[#2a292f] bg-term text-term-ink font-mono text-[12.5px] leading-relaxed flex flex-col h-[360px]">
          <div className="px-3 py-2 border-b border-[#2a292f] text-term-dim text-[11px] shrink-0">your chat · claude (team lead)</div>
          <div ref={term} className="p-3 flex-1 overflow-y-auto whitespace-pre-wrap break-words">
            {s.lead.length === 0 && <span className="text-term-dim">Press Play.</span>}
            {s.lead.map((l, i) => <span key={i} className={`block min-h-[1.6em] ${i === 0 ? 'text-term-cmd before:content-["❯_"] before:text-term-dim' : l.startsWith('✓') ? 'text-[#7fd39a]' : l.startsWith('↩') ? 'text-[#9ad0ff]' : 'text-term-ink'}`}>{l}</span>)}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-paper/60 flex flex-col h-[360px]">
          <p className="text-sm font-semibold px-3 py-2 border-b border-line shrink-0">Messages between teammates</p>
          <div ref={box} className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto">
            {s.msgs.length === 0 && <span className="text-xs text-ink-3">Nothing yet. The teammates message each other directly; the lead stays out of it.</span>}
            {s.msgs.map((m, i) => (
              <div key={i} className={`max-w-[92%] rounded-xl border px-3 py-2 text-[13px] leading-snug ${m.side === 'q' ? 'self-start bg-white border-line rounded-bl-sm' : m.side === 'f' ? 'self-end bg-team-soft border-team/40 rounded-br-sm' : 'self-center bg-white border-line italic text-ink-2 text-center'}`}>
                <span className="block font-mono text-[10px] text-ink-3 mb-0.5">{m.who}</span>{m.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-paper/60 p-3 mt-4">
        <p className="text-sm font-semibold mb-2">Twenty slots, two rules</p>
        <div className="grid md:grid-cols-2 gap-2">
          {(['quiz', 'flash'] as const).map((k) => (
            <div key={k} className="rounded-lg border border-line bg-white p-2.5">
              <div className="flex justify-between items-center font-mono text-xs font-semibold"><span>{k === 'quiz' ? 'quiz-writer' : 'flashcard-writer'}</span><span className="font-normal text-[10px] text-ink-2 border border-line rounded px-1 bg-paper whitespace-nowrap">{count(k)} / {k === 'quiz' ? 8 : 12}</span></div>
              <ul className="flex flex-wrap gap-1 mt-2">{s.lists[k].map(chip)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-2 grid md:grid-cols-2 gap-2">
          {RULES.map((r, i) => {
            const v = s.rules[i + 1];
            const c = v?.state === 'pass' ? 'border-ok bg-ok-soft' : v?.state === 'fail' ? 'border-bad bg-bad-soft' : 'border-line bg-white';
            return (
              <div key={i} className={`flex gap-2 rounded-lg border px-3 py-2 text-[13px] ${c}`}>
                <span className={`font-mono w-4 shrink-0 ${v?.state === 'pass' ? 'text-ok' : v?.state === 'fail' ? 'text-bad' : 'text-ink-3'}`}>{v?.state === 'pass' ? '✓' : v?.state === 'fail' ? '✗' : '·'}</span>
                <span>{r}{v?.why && <span className="block text-xs text-ink-2">{v.why}</span>}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
