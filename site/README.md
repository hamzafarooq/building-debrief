# Building Debrief

A lesson site that teaches a cohort of product managers how to make skills, sub-agents, agent teams and a memory layer in Claude Code, by walking them through building the [Debrief](..) project, which is the repository this folder lives in step by step.

- Astro, static output. Tailwind. React islands only for the interactive parts: `StepCheck`, `ProgressNav`, `Check`, `TerminalReplay`, `TeamReplay`.
- Progress is a map of step ids in `localStorage`. No backend.
- Fonts: DM Sans for text, JetBrains Mono for code and labels, from Google Fonts with system fallbacks. Light mode only.

```
npm install
npm run dev        # http://localhost:4321
npm run build      # dist/
npm run sync       # re-copy the lesson files from the Debrief repo (..)
```

`sync` also runs automatically before `dev` and `build`, so the files shown in the
lessons are always the ones currently in the Debrief repo, one level up. If that folder is not there,
for example on Vercel, sync says so and keeps the copies already committed.

## Deploy on Vercel

Import the repo, or run `vercel` in this folder. Astro static output needs no configuration.

## Layout

```
src/lib/lessons.ts        the lesson and step registry; the sidebar and progress derive from it
src/lib/progress.ts       the localStorage store
src/lib/replay.ts         playback engine shared by the two replay islands
src/content/files/        the real Debrief files learners create, copied by scripts/sync-files.mjs
src/content/replays.ts    scripted timelines from the real Module 02 run
src/pages/                home, setup, lessons/*
src/components/           Step, CodeBlock, Prompt, LessonHeader (static)
src/islands/              the React islands
```
