import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReplay } from '@/lib/replay';

// Scripted replay of one command: a chat pane, context meters, and agent lanes.
export type TermEvent =
  | { type: 'cmd'; text: string; ms?: number }
  | { type: 'line'; cls: 'sys' | 'out' | 'ok' | 'ret' | 'quote'; text: string; ms?: number }
  | { type: 'meter'; key: string; tokens: number; note?: string; bad?: boolean; ms?: number }
  | { type: 'ghost'; key: string; tokens: number; ms?: number }
  | { type: 'lane'; key: string; text: string; done?: boolean; ms?: number }
  | { type: 'note'; text: string; ms?: number };

export type Meter = { key: string; label: string; tone: 'you' | 'sub' | 'team' };
export type Lane = { key: string; name: string; tags: string[]; meter?: string };

const WINDOW = 200_000;
const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
const lineCls: Record<string, string> = {
  cmd: 'text-term-cmd before:content-["❯_"] before:text-term-dim',
  sys: 'text-term-dim', out: 'text-term-ink', ok: 'text-[#7fd39a]',
  ret: 'text-[#9ad0ff] before:content-["↩_"] before:text-term-dim',
  quote: 'text-[#c9c6bf] border-l-2 border-[#3a393f] pl-2',
};
const fill: Record<string, string> = { you: 'bg-skill', sub: 'bg-agent', team: 'bg-team' };

type State = {
  lines: { cls: string; text: string }[];
  meters: Record<string, { tokens: number; note?: string; bad?: boolean; ghost?: number }>;
  lanes: Record<string, { text: string; done?: boolean }>;
  note?: string;
};
const blank = (): State => ({ lines: [], meters: {}, lanes: {} });

export default function TerminalReplay({ title = 'your chat · claude', script, meters, lanes, lanesTitle = 'Loaded', autoplay = false }:
  { title?: string; script: TermEvent[]; meters: Meter[]; lanes: Lane[]; lanesTitle?: string; autoplay?: boolean }) {
  const [s, setS] = useState<State>(blank);
  const pane = useRef<HTMLDivElement>(null);

  const apply = useCallback((ev: TermEvent) => setS((p) => {
    const n: State = { ...p, lines: [...p.lines], meters: { ...p.meters }, lanes: { ...p.lanes } };
    if (ev.type === 'cmd') n.lines.push({ cls: 'cmd', text: ev.text });
    else if (ev.type === 'line') n.lines.push({ cls: ev.cls, text: ev.text });
    else if (ev.type === 'meter') n.meters[ev.key] = { ...n.meters[ev.key], tokens: ev.tokens, note: ev.note ?? n.meters[ev.key]?.note, bad: ev.bad };
    else if (ev.type === 'ghost') n.meters[ev.key] = { ...(n.meters[ev.key] ?? { tokens: 0 }), ghost: ev.tokens };
    else if (ev.type === 'lane') n.lanes[ev.key] = { text: ev.text, done: ev.done };
    else if (ev.type === 'note') n.note = ev.text;
    return n;
  }), []);
  const reset = useCallback(() => setS(blank()), []);
  const { status, speed, setSpeed, play, skip, stop } = useReplay(script, apply, reset);
  useEffect(() => { if (pane.current) pane.current.scrollTop = pane.current.scrollHeight; }, [s.lines.length]);
  useEffect(() => { if (autoplay) play(); }, []); // eslint-disable-line

  const meterEl = (m: Meter, small = false) => {
    const v = s.meters[m.key] ?? { tokens: 0 };
    return (
      <div key={m.key} className={small ? 'mt-2' : 'mt-1'}>
        <div className="flex justify-between font-mono text-[11px] text-ink-2 mb-1"><span>{m.label}</span><span>{fmt(v.tokens)}{m.tone === 'you' ? ' / 200k' : ''}</span></div>
        <div className={`relative ${small ? 'h-2' : 'h-3'} rounded-full bg-paper border border-line overflow-hidden`}>
          <div className={`h-full rounded-full transition-[width] duration-500 ${fill[m.tone]}`} style={{ width: `${Math.min(100, (v.tokens / WINDOW) * 100)}%` }} />
          {v.ghost ? <div className="absolute inset-y-0 left-0 transition-[width] duration-700" style={{ width: `${Math.min(100, (v.ghost / WINDOW) * 100)}%`, background: 'repeating-linear-gradient(45deg, transparent 0 6px, rgba(179,38,30,.35) 6px 8px)' }} /> : null}
        </div>
        {!small && <p className={`text-xs mt-1 min-h-4 ${v.bad ? 'text-bad' : 'text-ink-2'}`}>{v.note ?? ''}</p>}
      </div>
    );
  };
  const topMeters = useMemo(() => meters.filter((m) => !lanes.some((l) => l.meter === m.key)), [meters, lanes]);

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
      <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4 items-start">
        <div className="rounded-xl overflow-hidden border border-[#2a292f] bg-term text-term-ink font-mono text-[12.5px] leading-relaxed">
          <div className="px-3 py-2 border-b border-[#2a292f] text-term-dim text-[11px] flex items-center gap-2"><span className="flex gap-1"><i className="w-2.5 h-2.5 rounded-full bg-[#3a393f]" /><i className="w-2.5 h-2.5 rounded-full bg-[#3a393f]" /><i className="w-2.5 h-2.5 rounded-full bg-[#3a393f]" /></span>{title}</div>
          <div ref={pane} className="p-3 min-h-[260px] max-h-[420px] overflow-y-auto whitespace-pre-wrap break-words">
            {s.lines.length === 0 && <span className="text-term-dim">Press Play.</span>}
            {s.lines.map((l, i) => <span key={i} className={`block min-h-[1.6em] ${lineCls[l.cls]}`}>{l.text}</span>)}
          </div>
        </div>
        <div className="space-y-3">
          {topMeters.length > 0 && (
            <div className="rounded-xl border border-line bg-paper/60 p-3">
              <p className="text-sm font-semibold mb-1">Your context window <span className="font-mono text-[10px] font-normal text-ink-3 bg-white border border-line rounded px-1 ml-1">200k</span></p>
              {topMeters.map((m) => meterEl(m))}
            </div>
          )}
          {lanes.length > 0 && (
            <div className="rounded-xl border border-line bg-paper/60 p-3">
              <p className="text-sm font-semibold mb-2">{lanesTitle}</p>
              <div className="space-y-2">
                {lanes.map((l) => {
                  const v = s.lanes[l.key];
                  const m = meters.find((x) => x.key === l.meter);
                  return (
                    <div key={l.key} className={`rounded-lg border border-line bg-white px-3 py-2 transition-opacity ${v ? 'opacity-100' : 'opacity-40'}`}>
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs font-semibold">{l.name}{l.tags.map((t) => <span key={t} className="font-normal text-[10px] text-ink-2 border border-line rounded px-1 bg-paper">{t}</span>)}</div>
                      <p className={`font-mono text-[11px] mt-0.5 min-h-4 ${v?.done ? 'text-ok' : 'text-ink-2'}`}>{v?.text ?? ''}</p>
                      {m && meterEl(m, true)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {s.note && <div className="rounded-xl border-l-4 border-ink-3 bg-white border border-line p-3 text-sm">{s.note}</div>}
        </div>
      </div>
    </div>
  );
}
