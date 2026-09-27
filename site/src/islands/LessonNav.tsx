import { useProgress } from '@/lib/progress';
import { lessonBlocker, neighbours } from '@/lib/lessons';

// Previous / next links at the foot of a lesson. Next stays locked until this
// lesson and every one before it is fully marked done.
export default function LessonNav({ slug }: { slug: string }) {
  const state = useProgress();
  const { prev, next } = neighbours(slug);
  const nextLocked = next ? !!lessonBlocker(next.slug, state) : false;
  return (
    <nav className="mt-16 pt-6 border-t border-line flex justify-between gap-4 text-sm">
      {prev ? <a href={prev.href} className="group"><span className="block text-ink-3 font-mono text-xs">← Previous</span><span className="font-medium group-hover:underline">{prev.title}</span></a> : <span />}
      {next && (nextLocked ? (
        <span className="text-right text-ink-3" aria-disabled="true">
          <span className="block font-mono text-xs">Next · locked</span>
          <span className="font-medium">{next.title}</span>
          <span className="block text-xs mt-0.5">Mark every step above done, including the check, to open it.</span>
        </span>
      ) : (
        <a href={next.href} className="group text-right"><span className="block text-ink-3 font-mono text-xs">Next →</span><span className="font-medium group-hover:underline">{next.title}</span></a>
      ))}
    </nav>
  );
}
