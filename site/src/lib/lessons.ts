export type Lesson = {
  slug: string;
  href: string;
  kicker: string;
  title: string;
  steps: string[];
  tone: 'setup' | 'skill' | 'agent' | 'team' | 'vault';
};

// Step ids are `${slug}:${step}`. Progress and the sidebar both derive from this list.
export const LESSONS: Lesson[] = [
  { slug: 'setup', href: '/setup', kicker: 'Setup', title: 'Set up the repo', tone: 'setup',
    steps: ['install', 'vscode', 'folder', 'layout', 'transcript', 'claude-md', 'open'] },
  { slug: 'skills', href: '/lessons/skills', kicker: 'Lesson 1', title: 'Skills', tone: 'skill',
    steps: ['skill-file', 'run', 'inspect', 'check'] },
  { slug: 'sub-agents', href: '/lessons/sub-agents', kicker: 'Lesson 2', title: 'Sub-agents', tone: 'agent',
    steps: ['report-writer', 'faq-writer', 'beautiful-html', 'renderer', 'debrief', 'run', 'check'] },
  { slug: 'agent-teams', href: '/lessons/agent-teams', kicker: 'Lesson 3', title: 'Agent teams', tone: 'team',
    steps: ['flag', 'quiz-writer', 'flashcard-writer', 'debrief-team', 'run', 'check'] },
  { slug: 'memory-vault', href: '/lessons/memory-vault', kicker: 'Lesson 4', title: 'Memory and the vault', tone: 'vault',
    steps: ['plugin', 'wiki-update', 'wiki-keeper', 'vault-readme', 'run'] },
];

export const stepId = (slug: string, step: string) => `${slug}:${step}`;
export const lessonBySlug = (slug: string) => LESSONS.find((l) => l.slug === slug)!;
export const neighbours = (slug: string) => {
  const i = LESSONS.findIndex((l) => l.slug === slug);
  return { prev: LESSONS[i - 1] ?? null, next: LESSONS[i + 1] ?? null };
};
// The step before this one in its lesson, or null for a lesson's first step.
// A step stays locked until that one is marked done.
export const prevStepId = (id: string) => {
  const [slug, step] = id.split(':');
  const steps = lessonBySlug(slug)?.steps ?? [];
  const i = steps.indexOf(step);
  return i > 0 ? stepId(slug, steps[i - 1]) : null;
};

// A lesson opens only when every step of every lesson before it is done,
// the end-of-lesson check included. Returns the first unfinished earlier lesson, or null.
export const lessonBlocker = (slug: string, done: Record<string, true>) => {
  for (const l of LESSONS) {
    if (l.slug === slug) return null;
    if (l.steps.some((s) => !done[stepId(l.slug, s)])) return l;
  }
  return null;
};
