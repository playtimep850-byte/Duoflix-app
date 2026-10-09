import { useState, useEffect, useCallback } from 'react';

const XP_KEY = 'duoflix-xp';
const STREAK_KEY = 'duoflix-streak';
const DATE_KEY = 'duoflix-last-active';

interface StreakData {
  count: number;
  lastActiveDate: string;
}

function todayStr(): string {
  return new Date().toDateString();
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

function loadXP(): number {
  try {
    const raw = localStorage.getItem(XP_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const data = JSON.parse(raw) as StreakData;
      const lastDate = localStorage.getItem(DATE_KEY) || data.lastActiveDate;
      const today = todayStr();
      const gap = daysBetween(lastDate, today);

      if (gap <= 0) {
        return data;
      }
      if (gap === 1) {
        return { count: data.count, lastActiveDate: lastDate };
      }
      return { count: 0, lastActiveDate: lastDate };
    }
  } catch {
    // ignore
  }
  return { count: 0, lastActiveDate: '' };
}

export function useGamification() {
  const [xp, setXP] = useState<number>(() => loadXP());
  const [streak, setStreak] = useState<StreakData>(() => loadStreak());
  const [justEarnedXP, setJustEarnedXP] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(XP_KEY, String(xp));
    } catch {
      // ignore
    }
  }, [xp]);

  useEffect(() => {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
      localStorage.setItem(DATE_KEY, streak.lastActiveDate);
    } catch {
      // ignore
    }
  }, [streak]);

  const awardXP = useCallback((amount: number) => {
    setXP((prev) => prev + amount);
    setJustEarnedXP(amount);
    setTimeout(() => setJustEarnedXP(0), 3000);

    const today = todayStr();
    setStreak((prev) => {
      if (prev.lastActiveDate === today) {
        return prev;
      }
      const gap = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : -1;
      if (gap === 1) {
        return { count: prev.count + 1, lastActiveDate: today };
      }
      return { count: 1, lastActiveDate: today };
    });
  }, []);

  const reset = useCallback(() => {
    setXP(0);
    setStreak({ count: 0, lastActiveDate: '' });
  }, []);

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const xpForNextLevel = 100;

  return { xp, streak: streak.count, justEarnedXP, awardXP, reset, level, xpInLevel, xpForNextLevel };
}
