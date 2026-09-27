// Scripted timelines for the replay islands. Every number and line comes from the real Module 02 run.
import type { TermEvent, Meter, Lane } from '@/islands/TerminalReplay';
import type { TeamEvent } from '@/islands/TeamReplay';
import type { FlowNode, FlowEdge, FlowEvent, FlowLane } from '@/islands/FlowReplay';

const VTT = 43_000;
const ramp = (key: string, from: number, to: number, steps: number, ms: number): TermEvent[] =>
  Array.from({ length: steps }, (_, i) => ({ type: 'meter', key, tokens: Math.round(from + ((to - from) * (i + 1)) / steps), ms }));

export const skillMeters: Meter[] = [{ key: 'you', label: 'you', tone: 'you' }];
export const skillLanes: Lane[] = [
  { key: 'skill', name: '.claude/skills/recap-email/SKILL.md', tags: ['41 lines'] },
  { key: 'claude', name: 'CLAUDE.md', tags: ['how to read a transcript'] },
  { key: 'vtt', name: 'transcript/module-2.vtt', tags: ['3,810 cues'] },
];
export const skillScript: TermEvent[] = [
  { type: 'cmd', text: '/recap-email 02', ms: 500 },
  { type: 'lane', key: 'skill', text: 'loaded into your chat' },
  { type: 'line', cls: 'sys', text: 'Loaded skill recap-email · argument 02', ms: 400 },
  ...ramp('you', 0, 1800, 3, 120),
  { type: 'lane', key: 'claude', text: 'loaded at start of session' },
  { type: 'line', cls: 'out', text: 'Reading transcript/module-2.vtt in full, as the skill says.', ms: 400 },
  { type: 'lane', key: 'vtt', text: 'reading… 3,810 cues' },
  { type: 'line', cls: 'sys', text: 'Read transcript/module-2.vtt (3,810 lines)', ms: 200 },
  ...ramp('you', 1800, 1800 + VTT, 12, 180),
  { type: 'lane', key: 'vtt', text: 'in your context now', done: true },
  { type: 'meter', key: 'you', tokens: 1800 + VTT, note: 'The whole transcript sits in your chat.' },
  { type: 'line', cls: 'out', text: 'Seven taught topics, eight announcements, three next steps. Writing outputs/module-02/recap-email.md against the template.', ms: 700 },
  { type: 'line', cls: 'sys', text: 'Wrote outputs/module-02/recap-email.md', ms: 300 },
  { type: 'line', cls: 'quote', text: '**Subject:** Module 02 recap and next steps', ms: 150 },
  { type: 'line', cls: 'quote', text: 'Hi everyone,', ms: 120 },
  { type: 'line', cls: 'quote', text: 'Thanks for a lively Sunday session and for staying past the hour.', ms: 200 },
  { type: 'line', cls: 'quote', text: '## What we covered', ms: 120 },
  { type: 'line', cls: 'quote', text: '- CTL: an agent needs context, tools, and a loop. One answer is a plain LLM call.', ms: 160 },
  { type: 'line', cls: 'quote', text: '- The four layers of a full-stack product: front end, back end, AI backend, infrastructure.', ms: 160 },
  { type: 'line', cls: 'quote', text: '  …', ms: 250 },
  { type: 'line', cls: 'out', text: 'Recap email written. 348 words, under the 350 limit. Subject line and both closing lines match the template.', ms: 500 },
  ...ramp('you', 1800 + VTT, 1800 + VTT + 2400, 3, 120),
  { type: 'ghost', key: 'you', tokens: (1800 + VTT) * 5, ms: 300 },
  { type: 'meter', key: 'you', tokens: 1800 + VTT + 2400, note: 'Striped: what four more reads like this would need. It does not fit in 200k.', bad: true },
  { type: 'note', text: 'Look at the meter. The transcript is now in your chat. That is fine once. Four more reads like this one will not fit, and that is the reason for Lesson 2.' },
];

export const subMeters: Meter[] = [
  { key: 'you', label: 'you', tone: 'you' },
  { key: 'report', label: 'own context', tone: 'sub' },
  { key: 'faq', label: 'own context', tone: 'sub' },
  { key: 'render', label: 'own context', tone: 'sub' },
];
export const subLanes: Lane[] = [
  { key: 'report', name: 'report-writer', tags: ['Read, Write'], meter: 'report' },
  { key: 'faq', name: 'faq-writer', tags: ['Read, Write'], meter: 'faq' },
  { key: 'render', name: 'renderer', tags: ['Read, Write', 'skill: beautiful-html'], meter: 'render' },
];
export const subScript: TermEvent[] = [
  { type: 'cmd', text: '/debrief 02', ms: 500 },
  { type: 'line', cls: 'sys', text: 'Loaded skill debrief · argument 02', ms: 300 },
  ...ramp('you', 0, 1600, 2, 120),
  { type: 'line', cls: 'ok', text: '✓ transcript/module-2.vtt exists', ms: 200 },
  { type: 'line', cls: 'ok', text: '✓ outputs/module-02/ ready', ms: 300 },
  { type: 'line', cls: 'out', text: 'Launching report-writer and faq-writer in one turn, in parallel.', ms: 400 },
  { type: 'line', cls: 'sys', text: 'Agent report-writer started · "Module 02. Transcript: transcript/module-2.vtt. Output folder: outputs/module-02/."', ms: 150 },
  { type: 'line', cls: 'sys', text: 'Agent faq-writer started · same message', ms: 300 },
  { type: 'lane', key: 'report', text: 'reading transcript…' },
  { type: 'lane', key: 'faq', text: 'reading transcript…' },
  { type: 'meter', key: 'you', tokens: 2000, note: 'Two agents running. Your window barely moved.' },
  ...Array.from({ length: 10 }, (_, i): TermEvent[] => [
    { type: 'meter', key: 'report', tokens: Math.round((VTT * (i + 1)) / 10 * 1.02) },
    { type: 'meter', key: 'faq', tokens: Math.round((VTT * (i + 1)) / 10 * 0.98), ms: 200 },
  ]).flat(),
  { type: 'lane', key: 'report', text: 'writing session-report.md · 15 topics, 4 demos, 9 announcements' },
  { type: 'lane', key: 'faq', text: 'writing faq.md · 22 questions' },
  ...ramp('report', VTT, VTT + 6000, 4, 220),
  { type: 'meter', key: 'faq', tokens: VTT + 5000 },
  { type: 'lane', key: 'faq', text: 'done · faq.md', done: true },
  { type: 'line', cls: 'ret', text: 'faq-writer: No deferred questions. 22 questions written to outputs/module-02/faq.md.', ms: 500 },
  { type: 'lane', key: 'report', text: 'done · session-report.md', done: true },
  { type: 'line', cls: 'ret', text: "report-writer: 15 topics. 1 What differentiates a product when anyone can build · 2 Module 2 framing · 3 CTL and LLM call versus agent · 4 Danilo's Sharpen · 5 The four layers · … · 15 Which model and plan to use.", ms: 600 },
  { type: 'meter', key: 'you', tokens: 3400, note: 'Two short summaries came back. Not the transcript.' },
  { type: 'line', cls: 'out', text: 'report-writer finished, so the render can start. Launching renderer for session-report.md.', ms: 400 },
  { type: 'lane', key: 'render', text: 'reading session-report.md + cartesian.html…' },
  ...ramp('render', 0, 16000, 5, 200),
  { type: 'lane', key: 'render', text: 'done · session-report.html', done: true },
  { type: 'line', cls: 'ret', text: 'renderer: outputs/module-02/session-report.html · 19 slides', ms: 500 },
  { type: 'meter', key: 'you', tokens: 3900, note: 'Three files. Your chat never held the transcript.' },
  { type: 'line', cls: 'out', text: 'Three files in outputs/module-02/: session-report.md, faq.md, session-report.html.', ms: 300 },
  { type: 'note', text: 'Your chat never held the transcript. Two writers read it at the same time, each in its own window, and you got two short summaries back. Compare the meter with Lesson 1.' },
];

// The same /debrief 02 run as subScript, drawn as a graph of who hands work to whom.
export const subFlowNodes: FlowNode[] = [
  { id: 'you', kind: 'you', name: 'you', sub: 'your chat', x: 380, y: 50, ctx: true },
  { id: 'debrief', kind: 'skill', name: 'debrief', sub: 'skill · the runbook', x: 380, y: 150 },
  { id: 'report', kind: 'agent', name: 'report-writer', sub: 'sub-agent · own context', x: 220, y: 262, ctx: true, tools: 'Read, Write' },
  { id: 'faq', kind: 'agent', name: 'faq-writer', sub: 'sub-agent · own context', x: 540, y: 262, ctx: true, tools: 'Read, Write' },
  { id: 'reportmd', kind: 'file', name: 'session-report.md', sub: '', x: 220, y: 356 },
  { id: 'faqmd', kind: 'file', name: 'faq.md', sub: '', x: 540, y: 356, tag: 'ships as markdown' },
  { id: 'renderer', kind: 'agent', name: 'renderer', sub: 'sub-agent · own context', x: 220, y: 462, ctx: true, tools: 'Read, Write', skill: 'beautiful-html' },
  { id: 'html', kind: 'file', name: 'session-report.html', sub: '', x: 520, y: 462 },
];
export const subFlowEdges: FlowEdge[] = [
  { id: 'you-debrief', from: 'you', to: 'debrief' },
  { id: 'debrief-report', from: 'debrief', to: 'report' },
  { id: 'debrief-faq', from: 'debrief', to: 'faq' },
  { id: 'report-md', from: 'report', to: 'reportmd', label: 'writes' },
  { id: 'faq-md', from: 'faq', to: 'faqmd', label: 'writes' },
  { id: 'md-renderer', from: 'reportmd', to: 'renderer', label: 'once it exists' },
  { id: 'renderer-html', from: 'renderer', to: 'html', label: 'writes' },
];
const fill = (id: string, from: number, to: number, steps: number, ms: number): FlowEvent[] =>
  Array.from({ length: steps }, (_, i) => ({ type: 'node', id, ctx: Math.round(from + ((to - from) * (i + 1)) / steps), ms }));
export const subFlowScript: FlowEvent[] = [
  { type: 'step', text: 'You type /debrief 02. The debrief skill loads in your chat: a runbook that writes nothing itself.' },
  { type: 'node', id: 'you', state: 'working', note: 'typed /debrief 02' },
  { type: 'edge', id: 'you-debrief', state: 'flow' },
  { type: 'node', id: 'debrief', state: 'working', note: 'checking transcript + folder' },
  ...fill('you', 0, 1600, 4, 150),
  { type: 'node', id: 'you', state: 'waiting', note: 'your chat', ms: 900 },

  { type: 'step', text: 'transcript/module-2.vtt exists and outputs/module-02/ is ready, so it launches both writers in one turn, at the same moment.' },
  { type: 'edge', id: 'you-debrief', state: 'done' },
  { type: 'edge', id: 'debrief-report', state: 'flow' },
  { type: 'edge', id: 'debrief-faq', state: 'flow' },
  { type: 'node', id: 'debrief', state: 'waiting', note: 'waiting on two writers' },
  { type: 'node', id: 'report', state: 'working', note: 'reading transcript…' },
  { type: 'node', id: 'faq', state: 'working', note: 'reading transcript…' },
  { type: 'node', id: 'you', ctx: 2000, ms: 1300 },

  { type: 'step', text: 'Each writer reads the whole transcript, about 43k tokens, into its own context. Their bars fill. Yours does not move.' },
  { type: 'edge', id: 'debrief-report', state: 'done' },
  { type: 'edge', id: 'debrief-faq', state: 'done' },
  ...Array.from({ length: 10 }, (_, i): FlowEvent[] => [
    { type: 'node', id: 'report', ctx: Math.round((VTT * (i + 1)) / 10 * 1.02) },
    { type: 'node', id: 'faq', ctx: Math.round((VTT * (i + 1)) / 10 * 0.98), ms: 180 },
  ]).flat(),
  { type: 'node', id: 'you', note: 'your chat', ms: 500 },

  { type: 'step', text: 'They write. report-writer covers every topic, faq-writer every question. Neither choice affects the other, so they never need to talk.' },
  { type: 'node', id: 'report', note: 'writing 15 topics' },
  { type: 'node', id: 'faq', note: 'writing 22 questions' },
  { type: 'edge', id: 'report-md', state: 'flow' },
  { type: 'edge', id: 'faq-md', state: 'flow' },
  ...fill('report', VTT, VTT + 6000, 4, 220),
  { type: 'node', id: 'faq', ctx: VTT + 5000, ms: 400 },

  { type: 'step', text: 'faq-writer finishes first. faq.md is done and ships as markdown. What comes back to you is one line: 22 questions, none deferred.' },
  { type: 'node', id: 'faq', state: 'done', note: '22 questions · none deferred' },
  { type: 'edge', id: 'faq-md', state: 'done' },
  { type: 'node', id: 'faqmd', state: 'done' },
  { type: 'edge', id: 'debrief-faq', state: 'back' },
  { type: 'node', id: 'you', ctx: 2600, ms: 1300 },
  { type: 'edge', id: 'debrief-faq', state: 'done' },

  { type: 'step', text: 'report-writer finishes. session-report.md exists, and back comes a list of fifteen topic titles, not the transcript.' },
  { type: 'node', id: 'report', state: 'done', note: '15 topics written' },
  { type: 'edge', id: 'report-md', state: 'done' },
  { type: 'node', id: 'reportmd', state: 'done' },
  { type: 'edge', id: 'debrief-report', state: 'back' },
  { type: 'node', id: 'you', ctx: 3400, ms: 1300 },
  { type: 'edge', id: 'debrief-report', state: 'done' },

  { type: 'step', text: 'Only now can the renderer start, because it needs the finished report. It fills its own context with the report and the page template.' },
  { type: 'node', id: 'debrief', state: 'working', note: 'launching renderer' },
  { type: 'edge', id: 'md-renderer', state: 'flow' },
  { type: 'node', id: 'renderer', state: 'working', note: 'report + page template' },
  ...fill('renderer', 0, 16000, 6, 220),
  { type: 'node', id: 'debrief', state: 'waiting', note: 'waiting on renderer', ms: 300 },

  { type: 'step', text: 'The renderer writes session-report.html, 19 slides. Three files, and your chat never held the transcript.' },
  { type: 'edge', id: 'md-renderer', state: 'done' },
  { type: 'edge', id: 'renderer-html', state: 'flow' },
  { type: 'node', id: 'renderer', state: 'done', note: '19 slides', ms: 600 },
  { type: 'edge', id: 'renderer-html', state: 'done' },
  { type: 'node', id: 'html', state: 'done' },
  { type: 'node', id: 'debrief', state: 'done', note: 'three files listed' },
  { type: 'node', id: 'you', state: 'done', ctx: 3900, note: 'your chat · 3.9k used', ms: 400 },
  { type: 'final' },
];
export const subFlowFinal = `outputs/module-02/
  session-report.md      15 topics · 4 demos · 9 announcements
  faq.md                 22 questions · none deferred
  session-report.html    19 slides

Your context: 3.9k tokens. The 43k-token transcript never entered it.`;

const Q_TOPICS = ['differentiation', 'CTL', 'Sharpen as LLM call', 'the four layers', 'AI feature spec', 'Claude Code as harness', 'CLAUDE.md', 'skill.md'];
const CARDS_BEFORE = ['Harness', 'CTL', 'Agent', 'Front end', 'Backend', 'AI backend', 'Headless', 'Human in the loop', 'AI feature spec', 'Claude Code', 'CLAUDE.md', 'Skill.md'];
const CARDS_AFTER = ['Harness', 'CTL', 'LLM call', 'Agent', 'Front end', 'Backend', 'AI backend', 'Infrastructure and data layer', 'AI feature spec', 'Claude Code', 'CLAUDE.md', 'Skill.md'];

export const teamScript: TeamEvent[] = [
  { type: 'lead', text: '/debrief-team 02', ms: 500 },
  { type: 'lead', text: 'Loaded skill debrief-team · CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1', ms: 300 },
  { type: 'lead', text: '✓ outputs/module-02/session-report.md', ms: 150 },
  { type: 'lead', text: '✓ outputs/module-02/faq.md', ms: 300 },
  { type: 'lead', text: 'Creating a team of two: quiz-writer and flashcard-writer (sonnet). I am the lead and I stay out of the coverage question.', ms: 700 },
  { type: 'msg', who: 'quiz-writer → team', side: 'q', text: `Eight questions, early to late: ${Q_TOPICS.join(', ')}. Terms I lean on: harness, CTL, LLM call, agent, all four layers, AI feature spec, Claude Code, CLAUDE.md, skill.md.`, ms: 1100 },
  { type: 'list', key: 'quiz', items: Q_TOPICS },
  { type: 'msg', who: 'flashcard-writer → team', side: 'f', text: `Twelve terms I intend to define: ${CARDS_BEFORE.join(', ')}.`, ms: 1100 },
  { type: 'list', key: 'flash', items: CARDS_BEFORE, ms: 400 },
  { type: 'rule', n: 1, state: 'fail', why: 'Q4 needs Infrastructure and data layer. Q2 and Q3 need LLM call. No card for either.' },
  { type: 'missing', key: 'flash', items: ['Infrastructure and data layer', 'LLM call'], ms: 600 },
  { type: 'rule', n: 2, state: 'fail', why: 'Headless and Human in the loop: no question, no report concept, nothing uses them.' },
  { type: 'mark', key: 'flash', term: 'Headless', cls: 'bad' },
  { type: 'mark', key: 'flash', term: 'Human in the loop', cls: 'bad', ms: 500 },
  { type: 'msg', who: 'flashcard-writer → quiz-writer', side: 'f', text: 'Your question 4 asks for all four layers and I have three. Questions 2 and 3 rest on LLM call and I have no card for it. That is two cards I owe you, and I am full.', ms: 1300 },
  { type: 'msg', who: 'quiz-writer → flashcard-writer', side: 'q', text: 'Headless and Human in the loop are not in my eight and nothing else in the kit mentions them. Drop both. I will give up my asks for separate "LLM with context" and "money slide" cards and aim question 3 at CTL and LLM call instead.', ms: 1400 },
  { type: 'msg', who: 'flashcard-writer → quiz-writer', side: 'f', text: 'Agreed. Dropping those two, adding Infrastructure and data layer and LLM call. Still twelve.', ms: 1000 },
  { type: 'list', key: 'flash', items: CARDS_AFTER },
  { type: 'mark', key: 'flash', term: 'Infrastructure and data layer', cls: 'new' },
  { type: 'mark', key: 'flash', term: 'LLM call', cls: 'new' },
  { type: 'rule', n: 1, state: 'pass', why: 'Agreed on the lists. Not yet checked against any file.' },
  { type: 'rule', n: 2, state: 'pass', why: 'Agreed on the lists. Not yet checked against any file.', ms: 500 },
  { type: 'msg', who: 'quiz-writer → team', side: 'q', text: 'Confirmed. Eight stands, all timestamps cited.', ms: 700 },
  { type: 'msg', who: 'flashcard-writer → team', side: 'f', text: 'Confirmed on twelve.', ms: 700 },
  { type: 'msg', who: 'lead', side: 'lead', text: 'Both confirmed. The lead never arbitrated. Now they write, one at a time.', ms: 800 },
  { type: 'msg', who: 'quiz-writer → team', side: 'q', text: 'Writing quiz.md first, because my answers are pinned to timestamps. Done, and I will not touch it again.', ms: 1200 },
  { type: 'lead', text: '↩ quiz-writer: wrote outputs/module-02/quiz.md · no slot traded away.', ms: 600 },
  { type: 'msg', who: 'flashcard-writer → team', side: 'f', text: 'Reading quiz.md off disk, not the list we agreed. It matches. Writing flashcards.md against the file.', ms: 1200 },
  { type: 'lead', text: '↩ flashcard-writer: wrote outputs/module-02/flashcards.md · traded away Headless, Human in the loop · added Infrastructure and data layer, LLM call.', ms: 600 },
  { type: 'msg', who: 'lead', side: 'lead', text: 'Checking both files on disk against the two rules.', ms: 900 },
  { type: 'rule', n: 1, state: 'pass', why: 'Checked against quiz.md and flashcards.md as written, not as agreed.' },
  { type: 'rule', n: 2, state: 'pass', why: 'Checked against the files on disk. Both hold.', ms: 700 },
  { type: 'lead', text: '✓ Verified on disk. Launching renderer twice in one turn.', ms: 600 },
  { type: 'lead', text: '↩ renderer: quiz.html · 10 slides', ms: 300 },
  { type: 'lead', text: '↩ renderer: flashcards.html · 6 slides', ms: 400 },
  { type: 'lead', text: 'Four files. Every term the quiz tests has a card behind it.' },
];

// The same /debrief-team 02 run as teamScript, drawn as a graph. No token counts here:
// the team run was not metered, so the boxes show state, not context.
export const teamFlowNodes: FlowNode[] = [
  { id: 'rule1', kind: 'rule', name: 'Rule 1', sub: 'every term the quiz tests has a card', x: 125, y: 66 },
  { id: 'rule2', kind: 'rule', name: 'Rule 2', sub: 'every card is used by something', x: 125, y: 132 },
  { id: 'you', kind: 'you', name: 'you', sub: 'your chat', x: 380, y: 46 },
  { id: 'lead', kind: 'skill', name: 'debrief-team', sub: 'skill · the team lead', x: 380, y: 150 },
  { id: 'settings', kind: 'file', name: 'settings.json', sub: '', x: 640, y: 150 },
  { id: 'quiz', kind: 'teammate', name: 'quiz-writer', sub: 'teammate · own context', x: 190, y: 276, tools: 'Read, Write' },
  { id: 'flash', kind: 'teammate', name: 'flashcard-writer', sub: 'teammate · own context', x: 570, y: 276, tools: 'Read, Write' },
  { id: 'quizmd', kind: 'file', name: 'quiz.md', sub: '', x: 190, y: 372 },
  { id: 'flashmd', kind: 'file', name: 'flashcards.md', sub: '', x: 570, y: 372 },
  { id: 'renderer', kind: 'agent', name: 'renderer', sub: 'sub-agent · runs twice at once', x: 380, y: 482, tools: 'Read, Write', skill: 'beautiful-html' },
  { id: 'quizhtml', kind: 'file', name: 'quiz.html', sub: '', x: 150, y: 590 },
  { id: 'flashhtml', kind: 'file', name: 'flashcards.html', sub: '', x: 610, y: 590 },
];
export const teamFlowEdges: FlowEdge[] = [
  { id: 'you-lead', from: 'you', to: 'lead' },
  { id: 'settings-lead', from: 'settings', to: 'lead', label: 'teams on' },
  { id: 'lead-quiz', from: 'lead', to: 'quiz' },
  { id: 'lead-flash', from: 'lead', to: 'flash' },
  { id: 'talk', from: 'quiz', to: 'flash', label: 'message each other' },
  { id: 'quiz-md', from: 'quiz', to: 'quizmd', label: 'writes first' },
  { id: 'flash-md', from: 'flash', to: 'flashmd', label: 'writes second' },
  { id: 'md-md', from: 'quizmd', to: 'flashmd', label: 'read off disk' },
  { id: 'quizmd-r', from: 'quizmd', to: 'renderer' },
  { id: 'flashmd-r', from: 'flashmd', to: 'renderer' },
  { id: 'r-quiz', from: 'renderer', to: 'quizhtml' },
  { id: 'r-flash', from: 'renderer', to: 'flashhtml' },
];
export const teamFlowScript: FlowEvent[] = [
  { type: 'step', text: 'You type /debrief-team 02. The runbook loads as the team lead. Teams are an experimental feature, switched on in settings.json.' },
  { type: 'node', id: 'you', state: 'working', note: 'typed /debrief-team 02' },
  { type: 'node', id: 'settings', state: 'done' },
  { type: 'edge', id: 'settings-lead', state: 'flow' },
  { type: 'edge', id: 'you-lead', state: 'flow' },
  { type: 'node', id: 'lead', state: 'working', note: 'report + FAQ exist ✓', ms: 1400 },
  { type: 'node', id: 'you', state: 'waiting', note: 'your chat' },
  { type: 'edge', id: 'settings-lead', state: 'done' },
  { type: 'edge', id: 'you-lead', state: 'done', ms: 300 },

  { type: 'step', text: 'The lead creates a team of two. Twenty slots between them: eight questions, twelve cards. The lead stays out of the coverage question.' },
  { type: 'edge', id: 'lead-quiz', state: 'flow' },
  { type: 'edge', id: 'lead-flash', state: 'flow' },
  { type: 'node', id: 'lead', state: 'waiting', note: 'stays out of coverage' },
  { type: 'node', id: 'quiz', state: 'working', note: 'reading transcript + report' },
  { type: 'node', id: 'flash', state: 'working', note: 'reading transcript + report', ms: 1600 },
  { type: 'edge', id: 'lead-quiz', state: 'done' },
  { type: 'edge', id: 'lead-flash', state: 'done', ms: 200 },

  { type: 'step', text: 'quiz-writer posts its eight questions and the terms they lean on. It messages its teammate directly; nothing goes through you or the lead.' },
  { type: 'node', id: 'quiz', note: 'proposes 8 questions' },
  { type: 'edge', id: 'talk', state: 'flow' },
  { type: 'msg', from: 'quiz-writer', to: 'team', side: 'a', text: `Eight questions, early to late: ${Q_TOPICS.join(', ')}. Terms I lean on: harness, CTL, LLM call, agent, all four layers, AI feature spec, Claude Code, CLAUDE.md, skill.md.`, ms: 2200 },

  { type: 'step', text: 'flashcard-writer posts the twelve terms it intends to define.' },
  { type: 'node', id: 'flash', note: 'proposes 12 cards' },
  { type: 'edge', id: 'talk', state: 'back' },
  { type: 'msg', from: 'flashcard-writer', to: 'team', side: 'b', text: `Twelve terms I intend to define: ${CARDS_BEFORE.join(', ')}.`, ms: 2000 },

  { type: 'step', text: 'Checked against each other, both rules break. Questions need two terms that have no card, and two cards define terms nothing uses. Neither could have seen this alone.' },
  { type: 'node', id: 'rule1', state: 'fail', note: 'Q2–4 need LLM call, Infrastructure' },
  { type: 'node', id: 'rule2', state: 'fail', note: 'Headless, Human in the loop unused' },
  { type: 'msg', from: 'flashcard-writer', to: 'quiz-writer', side: 'b', text: 'Your question 4 asks for all four layers and I have three. Questions 2 and 3 rest on LLM call and I have no card for it. That is two cards I owe you, and I am full.', ms: 2400 },

  { type: 'step', text: 'They trade. quiz-writer names the two cards nothing uses; flashcard-writer swaps them for the two terms the quiz needs. Still twelve.' },
  { type: 'edge', id: 'talk', state: 'flow' },
  { type: 'msg', from: 'quiz-writer', to: 'flashcard-writer', side: 'a', text: 'Headless and Human in the loop are not in my eight and nothing else in the kit mentions them. Drop both. I will give up my asks for separate "LLM with context" and "money slide" cards and aim question 3 at CTL and LLM call instead.', ms: 2400 },
  { type: 'edge', id: 'talk', state: 'back' },
  { type: 'msg', from: 'flashcard-writer', to: 'quiz-writer', side: 'b', text: 'Agreed. Dropping those two, adding Infrastructure and data layer and LLM call. Still twelve.', ms: 1400 },
  { type: 'node', id: 'rule1', state: 'waiting', note: 'agreed on the lists, not yet on disk' },
  { type: 'node', id: 'rule2', state: 'waiting', note: 'agreed on the lists, not yet on disk', ms: 800 },

  { type: 'step', text: 'Both confirm. The lead never arbitrated. Nothing has been written yet.' },
  { type: 'edge', id: 'talk', state: 'flow' },
  { type: 'msg', from: 'quiz-writer', to: 'team', side: 'a', text: 'Confirmed. Eight stands, all timestamps cited.', ms: 900 },
  { type: 'edge', id: 'talk', state: 'back' },
  { type: 'msg', from: 'flashcard-writer', to: 'team', side: 'b', text: 'Confirmed on twelve.', ms: 800 },
  { type: 'edge', id: 'talk', state: 'done' },
  { type: 'msg', from: 'lead', to: 'you', side: 'lead', text: 'Both confirmed. Now they write, one at a time.', ms: 1000 },

  { type: 'step', text: 'quiz-writer writes quiz.md first, because its answers are pinned to timestamps and have the least room to move.' },
  { type: 'node', id: 'flash', state: 'waiting', note: 'waits for quiz.md' },
  { type: 'edge', id: 'quiz-md', state: 'flow' },
  { type: 'node', id: 'quiz', note: 'writing quiz.md', ms: 1600 },
  { type: 'edge', id: 'quiz-md', state: 'done' },
  { type: 'node', id: 'quizmd', state: 'done' },
  { type: 'node', id: 'quiz', state: 'done', note: 'no slot traded away', ms: 600 },

  { type: 'step', text: 'flashcard-writer reads quiz.md off disk, not the list they agreed, and writes flashcards.md against the file.' },
  { type: 'node', id: 'flash', state: 'working', note: 'reading quiz.md off disk' },
  { type: 'edge', id: 'md-md', state: 'flow', ms: 1400 },
  { type: 'edge', id: 'flash-md', state: 'flow' },
  { type: 'node', id: 'flash', note: 'writing flashcards.md', ms: 1400 },
  { type: 'edge', id: 'md-md', state: 'done' },
  { type: 'edge', id: 'flash-md', state: 'done' },
  { type: 'node', id: 'flashmd', state: 'done' },
  { type: 'node', id: 'flash', state: 'done', note: 'traded 2 cards, added 2', ms: 600 },

  { type: 'step', text: 'The lead checks both files on disk against the two rules: what was written, not what was agreed.' },
  { type: 'node', id: 'lead', state: 'working', note: 'checking both files on disk' },
  { type: 'node', id: 'rule1', state: 'working', note: 'reading quiz.md, flashcards.md' },
  { type: 'node', id: 'rule2', state: 'working', note: 'reading quiz.md, flashcards.md', ms: 1500 },
  { type: 'node', id: 'rule1', state: 'done', note: 'checked on disk' },
  { type: 'node', id: 'rule2', state: 'done', note: 'checked on disk', ms: 700 },

  { type: 'step', text: 'Verified, so it launches the renderer twice in one turn. An ordinary sub-agent, not a teammate: it has nothing to negotiate.' },
  { type: 'edge', id: 'quizmd-r', state: 'flow' },
  { type: 'edge', id: 'flashmd-r', state: 'flow' },
  { type: 'node', id: 'renderer', state: 'working', note: 'two renders at once', ms: 1500 },
  { type: 'edge', id: 'quizmd-r', state: 'done' },
  { type: 'edge', id: 'flashmd-r', state: 'done' },
  { type: 'edge', id: 'r-quiz', state: 'flow' },
  { type: 'edge', id: 'r-flash', state: 'flow', ms: 900 },
  { type: 'edge', id: 'r-quiz', state: 'done' },
  { type: 'edge', id: 'r-flash', state: 'done' },
  { type: 'node', id: 'quizhtml', state: 'done' },
  { type: 'node', id: 'flashhtml', state: 'done' },
  { type: 'node', id: 'renderer', state: 'done', note: 'quiz 10 slides · cards 6', ms: 500 },

  { type: 'step', text: 'Four files. Every term the quiz tests has a card behind it, and every card is used.' },
  { type: 'node', id: 'lead', state: 'done', note: 'four files, two trades' },
  { type: 'node', id: 'you', state: 'done', note: 'your chat' },
  { type: 'final' },
];
export const teamFlowFinal = `outputs/module-02/
  quiz.md            8 questions, every tested term has a card
  flashcards.md      12 cards
                       dropped: Headless, Human in the loop
                       added:   Infrastructure and data layer, LLM call
  quiz.html          10 slides
  flashcards.html    6 slides

Both rules checked against the files on disk, not the agreed lists.`;

export const vaultMeters: Meter[] = [
  { key: 'you', label: 'you', tone: 'you' },
  { key: 'keeper', label: 'own context', tone: 'sub' },
];
export const vaultLanes: Lane[] = [
  { key: 'keeper', name: 'vault:wiki-keeper', tags: ['Read, Write, Edit', 'Glob, Grep'], meter: 'keeper' },
];
export const vaultScript: TermEvent[] = [
  { type: 'cmd', text: '/vault:wiki-update 02', ms: 500 },
  { type: 'line', cls: 'sys', text: 'Loaded skill wiki-update from plugin vault', ms: 300 },
  { type: 'meter', key: 'you', tokens: 1400 },
  { type: 'line', cls: 'ok', text: '\u2713 outputs/module-02/session-report.md', ms: 120 },
  { type: 'line', cls: 'ok', text: '\u2713 outputs/module-02/faq.md, quiz.md, flashcards.md', ms: 300 },
  { type: 'line', cls: 'out', text: 'Launching vault:wiki-keeper once. The vault has exactly one writer.', ms: 500 },
  { type: 'lane', key: 'keeper', text: 'reading vault/README.md for the merge rules' },
  { type: 'meter', key: 'keeper', tokens: 3_000, ms: 600 },
  { type: 'lane', key: 'keeper', text: 'globbing vault/concepts, people, sessions' },
  { type: 'line', cls: 'sys', text: 'vault/ is empty. First ingest for this course.', ms: 500 },
  { type: 'meter', key: 'keeper', tokens: 5_000, ms: 400 },
  { type: 'lane', key: 'keeper', text: 'reading the four deliverables' },
  ...[9, 14, 19, 24].map((t): TermEvent => ({ type: 'meter', key: 'keeper', tokens: t * 1000, ms: 350 })),
  { type: 'lane', key: 'keeper', text: 'writing concepts/ \u00b7 12 pages' },
  { type: 'meter', key: 'keeper', tokens: 27_000, ms: 700 },
  { type: 'lane', key: 'keeper', text: 'writing people/ \u00b7 sessions/module-02.md \u00b7 index.md \u00b7 log.md' },
  { type: 'meter', key: 'keeper', tokens: 31_000, ms: 700 },
  { type: 'lane', key: 'keeper', text: 'done \u00b7 17 pages', done: true },
  { type: 'line', cls: 'ret', text: 'wiki-keeper: created 12 concept pages (harness, ctl, llm-call, agent, front-end, backend, ai-backend, infrastructure-and-data-layer, ai-feature-spec, claude-code, claude-md, skill-md), 3 people pages, sessions/module-02.md, index.md, log.md. No contradiction with an earlier module, because there is no earlier module.', ms: 800 },
  { type: 'meter', key: 'you', tokens: 2_600, note: 'One summary back. The vault is on disk, for people to read.' },
  { type: 'line', cls: 'out', text: '17 pages written to vault/. Run this again after Module 03 and concept pages gain a second line instead of a second page.', ms: 300 },
  { type: 'note', text: 'Nothing in the pipeline depends on this. Disable the plugin and /debrief and /debrief-team behave exactly as before.' },
];

// The whole project on one canvas for the home page: the real Module 02 runs of all
// four commands, one lane per lesson, played in the order you would type them.
export const pipeLanes: FlowLane[] = [
  { y: 34, h: 96, label: '/recap-email 02', tag: 'LESSON 1 · SKILL', color: '#b7791f' },
  { y: 142, h: 162, label: '/debrief 02', tag: 'LESSON 2 · SUB-AGENTS', color: '#0f766e' },
  { y: 316, h: 176, label: '/debrief-team 02', tag: 'LESSON 3 · AGENT TEAM', color: '#6d4fc2' },
  { y: 504, h: 96, label: '/vault:wiki-update 02', tag: 'LESSON 4 · MEMORY', color: '#b0256b' },
];
export const pipeNodes: FlowNode[] = [
  { id: 'recap', kind: 'skill', name: 'recap-email', sub: 'skill · in your chat', x: 90, y: 91 },
  { id: 'recapmd', kind: 'file', name: 'recap-email.md', sub: '', x: 270, y: 91, tag: 'the transcript sits in your chat' },
  { id: 'debrief', kind: 'skill', name: 'debrief', sub: 'skill · the runbook', x: 90, y: 232 },
  { id: 'report', kind: 'agent', name: 'report-writer', sub: 'sub-agent', x: 270, y: 199 },
  { id: 'faq', kind: 'agent', name: 'faq-writer', sub: 'sub-agent', x: 270, y: 265 },
  { id: 'render1', kind: 'agent', name: 'renderer', sub: 'sub-agent', x: 460, y: 199 },
  { id: 'faqmd', kind: 'file', name: 'faq.md', sub: '', x: 460, y: 265 },
  { id: 'reporthtml', kind: 'file', name: 'session-report.html', sub: '', x: 655, y: 199 },
  { id: 'team', kind: 'skill', name: 'debrief-team', sub: 'skill · the team lead', x: 90, y: 413 },
  { id: 'quiz', kind: 'teammate', name: 'quiz-writer', sub: 'teammate', x: 270, y: 373 },
  { id: 'flash', kind: 'teammate', name: 'flashcard-writer', sub: 'teammate', x: 270, y: 453 },
  { id: 'render2', kind: 'agent', name: 'renderer', sub: 'sub-agent', x: 460, y: 413 },
  { id: 'quizhtml', kind: 'file', name: 'quiz.html', sub: '', x: 655, y: 373 },
  { id: 'flashhtml', kind: 'file', name: 'flashcards.html', sub: '', x: 655, y: 453 },
  { id: 'wiki', kind: 'skill', name: 'wiki-update', sub: 'skill · from a plugin', x: 90, y: 561 },
  { id: 'keeper', kind: 'agent', name: 'wiki-keeper', sub: 'sub-agent', x: 270, y: 561 },
  { id: 'vault', kind: 'file', name: 'vault/', sub: '', x: 460, y: 561, tag: 'grows every module' },
];
export const pipeEdges: FlowEdge[] = [
  { id: 'recap-md', from: 'recap', to: 'recapmd' },
  { id: 'd-report', from: 'debrief', to: 'report' },
  { id: 'd-faq', from: 'debrief', to: 'faq' },
  { id: 'report-r', from: 'report', to: 'render1' },
  { id: 'faq-md', from: 'faq', to: 'faqmd' },
  { id: 'r-html', from: 'render1', to: 'reporthtml' },
  { id: 't-quiz', from: 'team', to: 'quiz' },
  { id: 't-flash', from: 'team', to: 'flash' },
  { id: 'talk', from: 'quiz', to: 'flash', label: 'message' },
  { id: 'quiz-r', from: 'quiz', to: 'render2' },
  { id: 'flash-r', from: 'flash', to: 'render2' },
  { id: 'r-quiz', from: 'render2', to: 'quizhtml' },
  { id: 'r-flash', from: 'render2', to: 'flashhtml' },
  { id: 'w-keeper', from: 'wiki', to: 'keeper' },
  { id: 'keeper-v', from: 'keeper', to: 'vault' },
];
export const pipeScript: FlowEvent[] = [
  { type: 'step', text: 'Lesson 1 · /recap-email 02. A skill runs in your own chat and reads the whole transcript there. One email, in the same shape every week.' },
  { type: 'node', id: 'recap', state: 'working', note: 'reading the transcript' },
  { type: 'edge', id: 'recap-md', state: 'flow', ms: 1800 },
  { type: 'edge', id: 'recap-md', state: 'done' },
  { type: 'node', id: 'recapmd', state: 'done' },
  { type: 'node', id: 'recap', state: 'done', note: '348 words', ms: 900 },

  { type: 'step', text: 'Lesson 2 · /debrief 02. The runbook hands the reading to two sub-agents at the same moment, each in its own context. Your chat stays clear.' },
  { type: 'node', id: 'debrief', state: 'working', note: 'launching two writers' },
  { type: 'edge', id: 'd-report', state: 'flow' },
  { type: 'edge', id: 'd-faq', state: 'flow' },
  { type: 'node', id: 'report', state: 'working', note: 'reading transcript' },
  { type: 'node', id: 'faq', state: 'working', note: 'reading transcript', ms: 1800 },
  { type: 'edge', id: 'd-report', state: 'done' },
  { type: 'edge', id: 'd-faq', state: 'done' },
  { type: 'node', id: 'debrief', state: 'waiting', note: 'waiting on writers' },

  { type: 'step', text: 'faq-writer finishes with 22 questions, shipped as markdown. report-writer finishes with 15 topics.' },
  { type: 'edge', id: 'faq-md', state: 'flow' },
  { type: 'node', id: 'faq', state: 'done', note: '22 questions', ms: 700 },
  { type: 'edge', id: 'faq-md', state: 'done' },
  { type: 'node', id: 'faqmd', state: 'done' },
  { type: 'node', id: 'report', state: 'done', note: '15 topics', ms: 900 },

  { type: 'step', text: 'Only then does the renderer start, because it needs the finished report. It turns it into a 19-slide page.' },
  { type: 'edge', id: 'report-r', state: 'flow' },
  { type: 'node', id: 'render1', state: 'working', note: 'report + template', ms: 1500 },
  { type: 'edge', id: 'report-r', state: 'done' },
  { type: 'edge', id: 'r-html', state: 'flow' },
  { type: 'node', id: 'render1', state: 'done', note: '19 slides', ms: 600 },
  { type: 'edge', id: 'r-html', state: 'done' },
  { type: 'node', id: 'reporthtml', state: 'done' },
  { type: 'node', id: 'debrief', state: 'done', note: 'three files' },

  { type: 'step', text: 'Lesson 3 · /debrief-team 02. Two teammates must agree before either writes: every term the quiz tests needs a card. They message each other directly.' },
  { type: 'node', id: 'team', state: 'working', note: 'creating a team of two' },
  { type: 'edge', id: 't-quiz', state: 'flow' },
  { type: 'edge', id: 't-flash', state: 'flow' },
  { type: 'node', id: 'quiz', state: 'working', note: 'proposes 8 questions' },
  { type: 'node', id: 'flash', state: 'working', note: 'proposes 12 cards', ms: 1000 },
  { type: 'edge', id: 't-quiz', state: 'done' },
  { type: 'edge', id: 't-flash', state: 'done' },
  { type: 'node', id: 'team', state: 'waiting', note: 'stays out of it' },
  { type: 'edge', id: 'talk', state: 'flow', ms: 1100 },
  { type: 'edge', id: 'talk', state: 'back', ms: 1100 },
  { type: 'edge', id: 'talk', state: 'flow', ms: 1100 },

  { type: 'step', text: 'They trade: two unused cards out, the two terms the quiz needs in. Still twelve. Then they write one at a time, the quiz first.' },
  { type: 'edge', id: 'talk', state: 'done' },
  { type: 'node', id: 'quiz', state: 'done', note: 'quiz.md written', ms: 900 },
  { type: 'node', id: 'flash', state: 'done', note: 'traded 2 · added 2', ms: 900 },

  { type: 'step', text: 'The lead checks both files on disk, then runs the renderer twice at once: a 10-slide quiz and a 6-slide set of flashcards.' },
  { type: 'edge', id: 'quiz-r', state: 'flow' },
  { type: 'edge', id: 'flash-r', state: 'flow' },
  { type: 'node', id: 'render2', state: 'working', note: 'two renders at once', ms: 1400 },
  { type: 'edge', id: 'quiz-r', state: 'done' },
  { type: 'edge', id: 'flash-r', state: 'done' },
  { type: 'edge', id: 'r-quiz', state: 'flow' },
  { type: 'edge', id: 'r-flash', state: 'flow', ms: 700 },
  { type: 'edge', id: 'r-quiz', state: 'done' },
  { type: 'edge', id: 'r-flash', state: 'done' },
  { type: 'node', id: 'quizhtml', state: 'done' },
  { type: 'node', id: 'flashhtml', state: 'done' },
  { type: 'node', id: 'render2', state: 'done', note: '10 + 6 slides' },
  { type: 'node', id: 'team', state: 'done', note: 'both rules hold', ms: 600 },

  { type: 'step', text: 'Lesson 4 · /vault:wiki-update 02. One agent, the only one allowed to write the vault, reads the finished documents and records what the course now knows.' },
  { type: 'node', id: 'wiki', state: 'working', note: 'one writer, runs last' },
  { type: 'edge', id: 'w-keeper', state: 'flow' },
  { type: 'node', id: 'keeper', state: 'working', note: 'reading the deliverables', ms: 1800 },
  { type: 'edge', id: 'w-keeper', state: 'done' },
  { type: 'edge', id: 'keeper-v', state: 'flow', ms: 800 },
  { type: 'edge', id: 'keeper-v', state: 'done' },
  { type: 'node', id: 'vault', state: 'done' },
  { type: 'node', id: 'keeper', state: 'done', note: '17 pages written' },
  { type: 'node', id: 'wiki', state: 'done', note: 'pages listed', ms: 600 },

  { type: 'step', text: 'One transcript in. Five documents, three web pages, and a vault that grows every week. You build each piece yourself, one lesson at a time.' },
  { type: 'final' },
];
export const pipeFinal = `outputs/module-02/
  recap-email.md         348 words                         Lesson 1
  session-report.md      15 topics                         Lesson 2
  faq.md                 22 questions
  session-report.html    19 slides
  quiz.md, quiz.html     8 questions, 10 slides            Lesson 3
  flashcards.md, .html   12 cards, 6 slides
vault/                   17 pages, added to every module   Lesson 4`;
