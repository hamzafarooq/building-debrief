// One source of truth for progress: a map of step id -> true, in localStorage.
// Every read and write is wrapped, so the page still works with storage blocked.
import { useSyncExternalStore } from 'react';

const KEY = 'bd:progress:v1';
type State = Record<string, true>;
let cache: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) || '{}') as State; } catch { cache = {}; }
  return cache!;
}
function write(next: State) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
}
export function isDone(id: string) { return !!read()[id]; }
export function setDone(id: string, done: boolean) {
  const next = { ...read() };
  if (done) next[id] = true; else delete next[id];
  write(next);
}
export function resetAll() { write({}); }
export function doneCount(ids: string[]) { const s = read(); return ids.filter((i) => s[i]).length; }

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; cb(); } };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage); };
}
const EMPTY: State = {};
export function useProgress(): State {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
