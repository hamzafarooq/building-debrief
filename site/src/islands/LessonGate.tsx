import { useEffect } from 'react';
import { useProgress } from '@/lib/progress';
import { lessonBlocker, lessonBySlug, stepId } from '@/lib/lessons';

// Shown instead of the lesson when an earlier lesson is unfinished. The lesson body
// is hidden by an attribute on <html>, set before paint by the inline script in Layout.
export default function LessonGate({ slug }: { slug: string }) {
  const state = useProgress();
  const blocker = lessonBlocker(slug, state);
  useEffect(() => {
    if (blocker) document.documentElement.setAttribute('data-locked', '');
    else document.documentElement.removeAttribute('data-locked');
  }, [blocker]);
  if (!blocker) return null;
  const left = blocker.steps.filter((s) => !state[stepId(blocker.slug, s)]).length;
  const here = lessonBySlug(slug);
  return (
    <div className="rounded-xl border border-line bg-white p-8 text-center max-w-xl mx-auto mt-10">
      <div className="w-12 h-12 rounded-full bg-line text-ink-3 grid place-items-center mx-auto mb-4">
        <svg viewBox="0 0 16 16" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3 mb-1">{here.kicker} · locked</p>
      <h1 className="text-2xl font-bold tracking-tight mb-2">{here.title}</h1>
      <p className="text-ink-2 mb-6">Finish <strong className="text-ink">{blocker.kicker}: {blocker.title}</strong> first. {left === 1 ? 'One step is' : `${left} steps are`} still not marked done there{blocker.steps.includes('check') ? ', including the check at the end' : ''}.</p>
      <a href={blocker.href} className="inline-block rounded-lg bg-ink text-paper px-5 py-2.5 font-medium">Go to {blocker.title} →</a>
    </div>
  );
}
