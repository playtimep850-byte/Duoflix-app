import { useState, useEffect, useCallback } from 'react';
import { UNITS } from '@/data/curriculum';

const STORAGE_KEY = 'duoflix-progress';

function getAllSubLessonIds(): string[] {
  const ids: string[] = [];
  for (const unit of UNITS) {
    for (const sub of unit.subLessons) {
      ids.push(sub.id);
    }
  }
  return ids;
}

const ALL_IDS = getAllSubLessonIds();

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      return new Set(arr.filter((id) => ALL_IDS.includes(id)));
    }
  } catch {
    // ignore
  }
  return new Set();
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    } catch {
      // ignore
    }
  }, [completed]);

  const completeLesson = useCallback((id: string) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      setJustCompletedId(id);
      return next;
    });
  }, []);

  const clearJustCompleted = useCallback(() => setJustCompletedId(null), []);

  const isUnlocked = useCallback(
    (subLessonId: string): boolean => {
      const idx = ALL_IDS.indexOf(subLessonId);
      if (idx <= 0) return true;
      return completed.has(ALL_IDS[idx - 1]);
    },
    [completed],
  );

  const isCompleted = useCallback((id: string) => completed.has(id), [completed]);

  const completedCount = completed.size;
  const totalCount = ALL_IDS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const reset = useCallback(() => setCompleted(new Set()), []);

  return { completed, completeLesson, isUnlocked, isCompleted, completedCount, totalCount, progressPercent, reset, justCompletedId, clearJustCompleted };
}
