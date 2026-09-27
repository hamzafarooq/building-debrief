// Copies the files learners will create from the Debrief repo (the parent of site/) into src/content/files,
// so the lesson always shows the real thing. Run: npm run sync
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const SRC = resolve('..');
const DST = resolve('src/content/files');
const FILES = [
  'CLAUDE.md',
  '.claude/settings.json',
  '.claude/skills/recap-email/SKILL.md',
  '.claude/skills/debrief/SKILL.md',
  '.claude/skills/debrief-team/SKILL.md',
  '.claude/skills/beautiful-html/SKILL.md',
  '.claude/agents/report-writer.md',
  '.claude/agents/faq-writer.md',
  '.claude/agents/renderer.md',
  '.claude/agents/quiz-writer.md',
  '.claude/agents/flashcard-writer.md',
  '.claude/agent-memory/report-writer/MEMORY.md',
  '.claude/agent-memory/report-writer/transcription-fixes.md',
  '.claude/agent-memory/flashcard-writer/carded-terms.md',
  '.claude/skills/vault/.claude-plugin/plugin.json',
  '.claude/skills/vault/README.md',
  '.claude/skills/vault/skills/wiki-update/SKILL.md',
  '.claude/skills/vault/agents/wiki-keeper.md',
  'vault/README.md',
];
// Diagrams from the repo's own guide, served as-is.
// sub-agents.svg is NOT synced: the site keeps its own version, which includes the renderer.
// skills.svg is NOT synced either: the site's version describes each skill in the bottom panel.
// architecture.svg is site-only too: the whole project, vault included. Not on any page at the moment.
const DIAGRAMS = ['agent-team.svg', 'pipeline.svg'];
// On Vercel only site/ is uploaded, so the parent exists but is not the Debrief repo.
if (!existsSync(resolve(SRC, 'CLAUDE.md'))) {
  console.log(`sync: ${SRC} not found, keeping the copies already in src/content/files`);
  process.exit(0);
}

for (const f of FILES) {
  const from = resolve(SRC, f);
  if (!existsSync(from)) { console.warn('missing', f); continue; }
  const to = resolve(DST, f.replace(/^\.claude\//, 'claude/'));
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to);
  console.log('synced', f);
}

const IMG = resolve('public/img');
mkdirSync(IMG, { recursive: true });
for (const d of DIAGRAMS) {
  const from = resolve(SRC, 'doc', d);
  if (!existsSync(from)) { console.warn('missing', d); continue; }
  cpSync(from, resolve(IMG, d));
  console.log('synced doc/' + d);
}

// The transcript learners download in setup step 3, served from the site itself.
const DL = resolve('public/files');
mkdirSync(DL, { recursive: true });
cpSync(resolve(SRC, 'transcript/module-2.vtt'), resolve(DL, 'module-2.vtt'));
console.log('synced transcript/module-2.vtt');
