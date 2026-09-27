import { useCallback, useState } from 'react';
import { useReplay } from '@/lib/replay';

// An animated node graph: who hands work to whom, and what state each one is in.
// Nodes go idle -> working -> done; an edge flows while something travels along it.
export type NodeKind = 'you' | 'skill' | 'agent' | 'teammate' | 'rule' | 'file';
export type FlowNode = { id: string; kind: NodeKind; name: string; sub: string; x: number; y: number; tag?: string; ctx?: boolean; tools?: string; skill?: string };
export type FlowEdge = { id: string; from: string; to: string; label?: string };
export type NodeState = 'idle' | 'working' | 'waiting' | 'done' | 'fail';
export type FlowEvent =
  | { type: 'step'; text: string; ms?: number }
  | { type: 'node'; id: string; state?: NodeState; note?: string; ctx?: number; ms?: number }
  | { type: 'edge'; id: string; state: 'idle' | 'flow' | 'back' | 'done'; ms?: number }
  | { type: 'msg'; from: string; to: string; side: 'a' | 'b' | 'lead'; text: string; ms?: number }
  | { type: 'final'; ms?: number };

type S = {
  step: number; text: string; final: boolean;
  msgs: { from: string; to: string; side: string; text: string }[];
  nodes: Record<string, { state: NodeState; note?: string; ctx: number }>;
  edges: Record<string, 'idle' | 'flow' | 'back' | 'done'>;
};

const CTX_MAX = 200_000;
const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : `${n}`);

const STATE_LABEL: Record<NodeState, string> = { idle: 'idle', working: 'working…', waiting: 'waiting', done: 'done', fail: 'broken' };
const RULE_LABEL: Record<NodeState, string> = { idle: 'unchecked', working: 'checking…', waiting: 'agreed', done: 'holds', fail: 'broken' };
const DOT: Record<NodeState, string> = { idle: '#b9b4a8', working: '#D97757', waiting: '#b7791f', done: '#1f7a3f', fail: '#b3261e' };

export type FlowLane = { y: number; h: number; label: string; tag?: string; color: string };

export default function FlowReplay({ nodes, edges, script, finalTitle, final, label, height = 500, compact = false, orient = 'tb', lanes = [] }: {
  nodes: FlowNode[]; edges: FlowEdge[]; script: FlowEvent[]; finalTitle: string; final: string; label: string; height?: number;
  compact?: boolean; orient?: 'tb' | 'lr'; lanes?: FlowLane[];
}) {
  // compact: smaller boxes, for a whole-pipeline view with several lanes.
  const [W, H, FW, FH] = compact ? [150, 54, 140, 34] : [210, 66, 176, 40];
  const M = compact ? { dotY: 12, stY: 15.5, nameY: 30, nameFs: 12, noteY: 45, noteFs: 9, fileFs: 10.5 } : { dotY: 14, stY: 17.5, nameY: 36, nameFs: 13.5, noteY: 53, noteFs: 10, fileFs: 11.5 };
  const hasMsgs = script.some((e) => e.type === 'msg');
  const total = script.filter((e) => e.type === 'step').length;
  const blank = useCallback((): S => ({
    step: 0, text: `Idle. Press run to replay our real ${label}.`, final: false, msgs: [],
    nodes: Object.fromEntries(nodes.map((n) => [n.id, { state: 'idle' as NodeState, ctx: 0 }])),
    edges: Object.fromEntries(edges.map((e) => [e.id, 'idle' as const])),
  }), [nodes, edges, label]);
  const [s, setS] = useState<S>(blank);

  const apply = useCallback((ev: FlowEvent) => setS((p) => {
    if (ev.type === 'step') return { ...p, step: p.step + 1, text: ev.text };
    if (ev.type === 'final') return { ...p, final: true };
    if (ev.type === 'msg') return { ...p, msgs: [...p.msgs, { from: ev.from, to: ev.to, side: ev.side, text: ev.text }] };
    if (ev.type === 'edge') return { ...p, edges: { ...p.edges, [ev.id]: ev.state } };
    const cur = p.nodes[ev.id];
    return { ...p, nodes: { ...p.nodes, [ev.id]: { state: ev.state ?? cur.state, note: ev.note ?? cur.note, ctx: ev.ctx ?? cur.ctx } } };
  }), []);
  const reset = useCallback(() => setS(blank()), [blank]);
  const { status, play, stop } = useReplay(script, apply, reset);

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const size = (n: FlowNode) => (n.kind === 'file' ? [FW, FH] : n.kind === 'rule' ? [W, 52] : [W, H + (n.tools ? 22 : 0) + (n.skill ? 20 : 0)]);
  const path = (e: FlowEdge) => {
    const a = byId[e.from], b = byId[e.to];
    const [, ah] = size(a), [, bh] = size(b);
    if (orient === 'lr' && Math.abs(a.x - b.x) < 10) {
      const down = b.y > a.y ? 1 : -1;
      return `M${a.x} ${a.y + (down * ah) / 2} L${b.x} ${b.y - (down * bh) / 2}`;
    }
    if (orient === 'lr' && Math.abs(a.y - b.y) >= 10) {
      const [aw] = size(a), [bw] = size(b);
      const x1 = a.x + aw / 2, x2 = b.x - bw / 2, mx = (x1 + x2) / 2;
      return `M${x1} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${x2} ${b.y}`;
    }
    if (Math.abs(a.y - b.y) < 10) {
      const [aw] = size(a), [bw] = size(b);
      const dir = b.x > a.x ? 1 : -1;
      return `M${a.x + (dir * aw) / 2} ${a.y} L${b.x - (dir * bw) / 2} ${b.y}`;
    }
    const y1 = a.y + ah / 2, y2 = b.y - bh / 2, my = (y1 + y2) / 2;
    return `M${a.x} ${y1} C${a.x} ${my} ${b.x} ${my} ${b.x} ${y2}`;
  };

  return (
    <div className="not-prose">
      <style>{`
        @keyframes fr-dash { to { stroke-dashoffset: -24; } }
        @keyframes fr-dash-back { to { stroke-dashoffset: 24; } }
        @keyframes fr-pulse { 0% { opacity: .8; transform: scale(.6); } 100% { opacity: 0; transform: scale(2.2); } }
        @keyframes fr-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .fr-flow { stroke-dasharray: 6 6; animation: fr-dash .8s linear infinite; }
        .fr-back { stroke-dasharray: 6 6; animation: fr-dash-back .8s linear infinite; }
        .fr-pulse { transform-box: fill-box; transform-origin: center; animation: fr-pulse 1.2s ease-out infinite; }
        .fr-rise { animation: fr-rise .35s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .fr-flow, .fr-back, .fr-pulse { animation: none; } }
      `}</style>

      <div className="rounded-xl border border-line overflow-x-auto"
        style={{ backgroundColor: '#f4f1ea' }}>
        <svg viewBox={`0 0 760 ${height}`} className="block w-full min-w-[640px]" role="img"
          aria-label={`Animated diagram, step ${s.step} of ${total}. ${s.text}`}>
          <text x="14" y="22" fontSize="10" fill="#8b877d" fontFamily="JetBrains Mono, monospace" letterSpacing="1">{label.toUpperCase()}</text>
          <text x="746" y={height - 12} fontSize="10" fill="#8b877d" textAnchor="end" fontFamily="JetBrains Mono, monospace" letterSpacing="1">{[
            [nodes.filter((n) => n.kind === 'teammate').length, 'TEAMMATES'],
            [new Set(nodes.filter((n) => n.kind === 'agent').map((n) => n.name)).size, 'SUB-AGENT'],
            [nodes.filter((n) => n.kind === 'file').length, 'FILES'],
          ].filter(([c]) => c).map(([c, w]) => `${c} ${w}${w === 'SUB-AGENT' && c !== 1 ? 'S' : ''}`).join(' · ')}</text>

          {lanes.map((l) => (
            <g key={l.label}>
              <rect x="8" y={l.y} width="744" height={l.h} rx="12" fill="#faf8f4" stroke={l.color} strokeOpacity=".55" strokeDasharray="5 5" />
              <text x="22" y={l.y + 18} fontSize="11" fontWeight="600" fill="#1b1a17" fontFamily="JetBrains Mono, monospace">{l.label}</text>
              {l.tag && <text x="738" y={l.y + 18} fontSize="9.5" fill={l.color} textAnchor="end" fontFamily="JetBrains Mono, monospace" letterSpacing="1">{l.tag}</text>}
            </g>
          ))}

          {edges.map((e) => {
            const st = s.edges[e.id];
            const stroke = st === 'flow' || st === 'back' ? '#D97757' : st === 'done' ? '#9d998e' : '#cfcabe';
            return (
              <g key={e.id}>
                <path d={path(e)} fill="none" stroke={stroke} strokeWidth={st === 'flow' || st === 'back' ? 2 : 1.4}
                  className={st === 'flow' ? 'fr-flow' : st === 'back' ? 'fr-back' : ''} strokeDasharray={st === 'idle' ? '3 5' : undefined} />
                {e.label && st !== 'idle' && (() => {
                  const a = byId[e.from], b = byId[e.to];
                  const flat = Math.abs(a.y - b.y) < 10;
                  const [aw] = size(a), [bw] = size(b);
                  const [l, r] = a.x < b.x ? [a.x + aw / 2, b.x - bw / 2] : [b.x + bw / 2, a.x - aw / 2];
                  const side = orient === 'lr' && !flat && Math.abs(a.x - b.x) >= 10;
                  const lx = flat || side ? (l + r) / 2 : a.x + 8;
                  const ly = flat ? a.y - 7 : side ? (a.y + b.y) / 2 - 5 : (a.y + size(a)[1] / 2 + b.y - size(b)[1] / 2) / 2 + 4;
                  return <text x={lx} y={ly} fontSize="10" fill="#7c7a70" textAnchor={flat || side ? 'middle' : 'start'} fontFamily="DM Sans, sans-serif">{e.label}</text>;
                })()}
              </g>
            );
          })}

          {nodes.map((n) => {
            const st = s.nodes[n.id];
            const [w, h] = size(n);
            const x = n.x - w / 2, y = n.y - h / 2;
            if (n.kind === 'file') {
              const made = st.state === 'done';
              return (
                <g key={n.id} opacity={made ? 1 : 0.45}>
                  <rect x={x} y={y} width={w} height={h} rx="7" fill={made ? '#F1EEE4' : 'transparent'} stroke={made ? '#cfc9ba' : '#bdb8ac'} strokeDasharray={made ? undefined : '4 4'} />
                  <text x={n.x} y={n.y + 4} fontSize={M.fileFs} fill="#1b1a17" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{n.name}</text>
                  {n.tag && made && (
                    <g className="fr-rise">
                      <rect x={x + w + 10} y={n.y - 11} width={n.tag.length * 5.9 + 16} height="22" rx="11" fill="#fff" stroke="#e4e0d6" />
                      <text x={x + w + 18} y={n.y + 4} fontSize="10.5" fill="#55524a" fontFamily="DM Sans, sans-serif">{n.tag}</text>
                    </g>
                  )}
                </g>
              );
            }
            if (n.kind === 'rule') {
              const c = DOT[st.state];
              return (
                <g key={n.id}>
                  <rect x={x} y={y} width={w} height={h} rx="8" fill={st.state === 'fail' ? '#fbe3e1' : st.state === 'done' ? '#dff3e5' : '#fff'} stroke={st.state === 'idle' ? '#dcd7cb' : c} strokeWidth={st.state === 'idle' ? 1 : 1.4} />
                  {st.state === 'working' && <circle cx={x + 14} cy={y + 14} r="4" fill={c} className="fr-pulse" />}
                  <circle cx={x + 14} cy={y + 14} r="3" fill={c} />
                  <text x={x + 24} y={y + 17.5} fontSize="9" fill={c} fontFamily="JetBrains Mono, monospace" letterSpacing="1">{n.name.toUpperCase()} · {RULE_LABEL[st.state].toUpperCase()}</text>
                  <text x={x + 12} y={y + 33} fontSize="10.5" fill="#1b1a17" fontFamily="DM Sans, sans-serif">{n.sub}</text>
                  <text x={x + 12} y={y + 46} fontSize="9.5" fill="#7c7a70" fontFamily="DM Sans, sans-serif">{st.note ?? ''}</text>
                </g>
              );
            }
            const border = st.state === 'working' ? '#D97757' : st.state === 'done' ? '#1f7a3f' : st.state === 'waiting' ? '#d8b36a' : n.kind === 'skill' ? '#E7BCA6' : n.kind === 'teammate' ? '#E7A98F' : '#dcd7cb';
            const fill = n.kind === 'skill' ? '#FDF6F2' : n.kind === 'you' ? '#FFFFFF' : '#FFFFFF';
            return (
              <g key={n.id}>
                {(st.state === 'working' || st.state === 'done') && <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="11" fill="none" stroke={border} strokeOpacity=".18" strokeWidth="4" />}
                <rect x={x} y={y} width={w} height={h} rx="8" fill={fill} stroke={border} strokeWidth={st.state === 'idle' ? 1 : 1.5} />
                {st.state === 'working' && <circle cx={x + 14} cy={y + M.dotY} r="4" fill={DOT.working} className="fr-pulse" />}
                <circle cx={x + 14} cy={y + M.dotY} r="3" fill={DOT[st.state]} />
                <text x={x + 24} y={y + M.stY} fontSize={compact ? 8.5 : 9} fill={DOT[st.state]} fontFamily="JetBrains Mono, monospace" letterSpacing="1">{STATE_LABEL[st.state].toUpperCase()}</text>
                <text x={x + 12} y={y + M.nameY} fontSize={M.nameFs} fill="#1b1a17" fontFamily="JetBrains Mono, monospace">{n.name}</text>
                <text x={x + 12} y={y + M.noteY} fontSize={M.noteFs} fill="#8b877d" fontFamily="DM Sans, sans-serif">{st.note ?? n.sub}</text>
                {n.tools && (
                  <g>
                    <line x1={x + 12} y1={y + 64} x2={x + w - 12} y2={y + 64} stroke="#efece4" />
                    <text x={x + 12} y={y + 79} fontSize="9" fill="#8b877d" fontFamily="JetBrains Mono, monospace" letterSpacing=".5">TOOLS</text>
                    <rect x={x + 54} y={y + 69} width={n.tools.length * 6.1 + 12} height="15" rx="4" fill="#f4f1ea" stroke="#dcd7cb" strokeWidth=".7" />
                    <text x={x + 60} y={y + 80} fontSize="9.5" fill="#3d3c37" fontFamily="JetBrains Mono, monospace">{n.tools}</text>
                  </g>
                )}
                {n.skill && (
                  <g>
                    <text x={x + 12} y={y + 99} fontSize="9" fill="#b0603e" fontFamily="JetBrains Mono, monospace" letterSpacing=".5">SKILL</text>
                    <rect x={x + 54} y={y + 89} width={n.skill.length * 6.1 + 12} height="15" rx="4" fill="#FBEFE9" stroke="#E7BCA6" strokeWidth=".7" />
                    <text x={x + 60} y={y + 100} fontSize="9.5" fill="#1b1a17" fontFamily="JetBrains Mono, monospace">{n.skill}</text>
                  </g>
                )}
                {n.ctx && (
                  <g>
                    <rect x={x + w - 58} y={y + 9} width="46" height="7" rx="3.5" fill="#efece4" stroke="#dcd7cb" strokeWidth=".6" />
                    <rect x={x + w - 58} y={y + 9} width={Math.max(0, Math.min(46, (46 * st.ctx) / CTX_MAX))} height="7" rx="3.5" fill={n.kind === 'you' ? '#8FA88B' : '#C8785C'} style={{ transition: 'width .25s' }} />
                    <text x={x + w - 12} y={y + 27} fontSize="8.5" fill="#8b877d" textAnchor="end" fontFamily="JetBrains Mono, monospace">{fmt(st.ctx)}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {hasMsgs && (
        <div className="mt-3 rounded-xl border border-line bg-white">
          <div className="px-4 py-2 border-b border-line font-mono text-[11px] uppercase tracking-wider text-ink-3 flex justify-between">
            <span>Messages between teammates</span><span>{s.msgs.filter((m) => m.side !== 'lead').length}</span>
          </div>
          <div className="px-4 py-3 space-y-2 max-h-72 overflow-y-auto flex flex-col" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
            {s.msgs.length === 0 && <p className="text-sm text-ink-3">Nothing yet. The teammates message each other directly, and the lead stays out of it.</p>}
            {s.msgs.map((m, i) => (
              <div key={i} className={`fr-rise max-w-[85%] rounded-lg px-3 py-2 text-[13.5px] leading-snug ${m.side === 'a' ? 'self-start bg-[#FBEFE9] border border-[#E7BCA6]' : m.side === 'b' ? 'self-end bg-[#f4f1ea] border border-line-2' : 'self-center bg-paper border border-dashed border-line-2 text-ink-2 text-center'}`}>
                <span className="block font-mono text-[10.5px] text-ink-3 mb-0.5">{m.from} → {m.to}</span>
                {m.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-3">
        {status === 'running' ? (
          <button disabled className="inline-flex items-center gap-2 rounded-lg bg-ink-3 text-white text-sm px-4 py-2">
            <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Running…
          </button>
        ) : (
          <button onClick={() => play()} className="rounded-lg bg-ink text-paper text-sm font-medium px-4 py-2 hover:bg-ink-2">
            {status === 'done' ? '↻ Run again' : '▸ Run demo'}
          </button>
        )}
        {status !== 'idle' && <button onClick={stop} className="rounded-lg border border-line-2 bg-white text-sm px-4 py-2 hover:border-ink-3">Reset</button>}
        <span className="font-mono text-xs text-ink-3">{status === 'idle' ? 'idle · ready' : status === 'done' ? `finished · ${total} steps` : `step ${s.step} of ${total}`}</span>
      </div>

      <p className="mt-3 text-[15px] text-ink-2 min-h-[3rem]" aria-live="polite">{s.text}</p>

      {s.final && (
        <div className="fr-rise mt-2 rounded-xl border border-line bg-white overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2.5 border-b border-line bg-paper">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Final output</span>
            <span className="text-xs text-ink-3">{finalTitle}</span>
          </div>
          <pre className="px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink whitespace-pre-wrap">{final}</pre>
        </div>
      )}
    </div>
  );
}
