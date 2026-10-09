import { useState, useEffect } from 'react';
import { Lock, Check, Play, ChevronDown, ChevronUp, Video, BookOpen, PenLine, Mic2, Crown, Star, Flame, Zap, Award } from 'lucide-react';
import type { SubLesson, Unit } from '@/types';
import { UNITS } from '@/data/curriculum';
import { LessonModal } from '@/components/LessonModal';
import { ProgressBar } from '@/components/ProgressBar';
import { Confetti } from '@/components/Confetti';
import { useProgress } from '@/hooks/useProgress';
import { useGamification } from '@/hooks/useGamification';

const TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  reading: BookOpen,
  grammar: PenLine,
  pronunciation: Mic2,
};

interface LearnScreenProps {
  onPremiumClick: () => void;
}

export function LearnScreen({ onPremiumClick }: LearnScreenProps) {
  const { isUnlocked, isCompleted, completeLesson, completedCount, totalCount, progressPercent, justCompletedId, clearJustCompleted } = useProgress();
  const { xp, streak, justEarnedXP, awardXP, level, xpInLevel, xpForNextLevel } = useGamification();
  useEffect(() => {
    const handleXPEvent = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      awardXP(detail);
    };
    window.addEventListener('duoflix-award-xp', handleXPEvent as EventListener);
    return () => window.removeEventListener('duoflix-award-xp', handleXPEvent as EventListener);
  }, [awardXP]);

  const [expandedUnit, setExpandedUnit] = useState<number | null>(1);
  const [activeLesson, setActiveLesson] = useState<{ unit: Unit; sub: SubLesson } | null>(null);

  const toggleUnit = (id: number) => {
    setExpandedUnit((prev) => (prev === id ? null : id));
  };

  const handleLessonClick = (unit: Unit, sub: SubLesson) => {
    if (!isUnlocked(sub.id)) return;
    setActiveLesson({ unit, sub });
  };

  const handleComplete = () => {
    if (activeLesson) {
      const wasAlreadyDone = isCompleted(activeLesson.sub.id);
      completeLesson(activeLesson.sub.id);
      if (!wasAlreadyDone) {
        awardXP(25);
      }
      setActiveLesson(null);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Confetti on completion */}
      <Confetti active={!!justCompletedId} duration={3000} />

      {/* XP toast */}
      {justEarnedXP > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[55] animate-slide-down">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl gold-gradient text-ink-900 font-bold text-sm gold-glow-strong">
            <Zap className="w-4 h-4 fill-ink-900" />
            +{justEarnedXP} XP
          </div>
        </div>
      )}

      {/* Hero header */}
      <div className="relative overflow-hidden px-5 pt-12 pb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/8 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Journey</p>
              <h1 className="text-2xl font-bold gold-text font-serif">Learn English</h1>
            </div>
            <button
              onClick={onPremiumClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/30 text-xs font-semibold text-gold-300 hover:bg-gold-400/20 transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              Go Premium
            </button>
          </div>

          {/* Stats row: XP + Streak + Level */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl glass border border-ink-600/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Zap className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-xs font-medium text-gray-500">XP</span>
              </div>
              <p className="text-lg font-bold gold-text tabular-nums">{xp}</p>
            </div>
            <div className="rounded-2xl glass border border-ink-600/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium text-gray-500">Streak</span>
              </div>
              <p className="text-lg font-bold text-orange-400 tabular-nums">{streak}</p>
            </div>
            <div className="rounded-2xl glass border border-ink-600/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Award className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-xs font-medium text-gray-500">Level</span>
              </div>
              <p className="text-lg font-bold gold-text tabular-nums">{level}</p>
            </div>
          </div>

          {/* Level progress */}
          <div className="mt-2 rounded-2xl glass border border-ink-600/50 p-3">
            <ProgressBar percent={Math.round((xpInLevel / xpForNextLevel) * 100)} label={`Level ${level} progress`} />
          </div>

          {/* Overall lesson progress */}
          <div className="mt-2 rounded-2xl glass border border-ink-600/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">Overall Progress</p>
                <p className="text-lg font-bold text-white">{completedCount} <span className="text-gray-500 text-sm font-normal">/ {totalCount} lessons</span></p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                <span className="text-sm font-bold gold-text">{progressPercent}%</span>
              </div>
            </div>
            <ProgressBar percent={progressPercent} />
          </div>
        </div>
      </div>

      {/* Learning path */}
      <div className="px-5">
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-ink-600 -translate-x-1/2" />

          {UNITS.map((unit, idx) => {
            const isExpanded = expandedUnit === unit.id;
            const allSubsDone = unit.subLessons.every((s) => isCompleted(s.id));
            const someDone = unit.subLessons.some((s) => isCompleted(s.id));
            const isFirstUnit = unit.id === 1;
            const firstSubUnlocked = isUnlocked(unit.subLessons[0].id);
            const isAccessible = isFirstUnit || firstSubUnlocked || someDone;
            const isLast = idx === UNITS.length - 1;

            return (
              <div key={unit.id} className="relative mb-3">
                {/* Node dot on the path */}
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0 z-10">
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      allSubsDone
                        ? 'gold-gradient border-gold-400 gold-glow'
                        : someDone
                        ? 'border-gold-400 bg-ink-800'
                        : isAccessible
                        ? 'border-gold-400/50 bg-ink-800'
                        : 'border-ink-500 bg-ink-700'
                    }`}
                  />
                </div>

                {/* Unit card */}
                <div
                  className={`mt-6 rounded-2xl border transition-all ${
                    allSubsDone
                      ? 'border-gold-400/30 bg-gradient-to-br from-gold-400/5 to-ink-800'
                      : isAccessible
                      ? 'border-ink-600 bg-ink-800'
                      : 'border-ink-700 bg-ink-800/50'
                  }`}
                >
                  <button
                    onClick={() => isAccessible && toggleUnit(unit.id)}
                    disabled={!isAccessible}
                    className={`w-full flex items-center gap-3 p-4 text-left ${!isAccessible ? 'cursor-not-allowed' : ''}`}
                  >
                    <div
                      className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                        allSubsDone ? 'bg-gold-400/15' : isAccessible ? 'bg-ink-700' : 'bg-ink-700/50 grayscale'
                      }`}
                    >
                      {isAccessible ? unit.icon : <Lock className="w-5 h-5 text-gold-400/60" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold truncate ${isAccessible ? 'text-white' : 'text-gray-600'}`}>
                          {unit.title}
                        </p>
                        {allSubsDone && (
                          <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${isAccessible ? 'text-gray-500' : 'text-gray-700'}`}>
                        {isAccessible ? unit.subtitle : 'Finish previous lesson to unlock'}
                      </p>
                      {someDone && !allSubsDone && (
                        <div className="mt-1.5">
                          <ProgressBar
                            percent={Math.round(
                              (unit.subLessons.filter((s) => isCompleted(s.id)).length / unit.subLessons.length) * 100,
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {isAccessible && (
                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Expanded sub-lessons */}
                  {isExpanded && isAccessible && (
                    <div className="px-4 pb-4 space-y-2 animate-slide-down">
                      {unit.subLessons.map((sub) => {
                        const unlocked = isUnlocked(sub.id);
                        const done = isCompleted(sub.id);
                        const Icon = TYPE_ICONS[sub.type];
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleLessonClick(unit, sub)}
                            disabled={!unlocked}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              done
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : unlocked
                                ? 'border-ink-600 bg-ink-700/50 hover:border-gold-400/40 hover:bg-ink-700'
                                : 'border-ink-700 bg-ink-800/30 cursor-not-allowed'
                            }`}
                          >
                            <div
                              className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                done
                                  ? 'bg-emerald-500/20'
                                  : unlocked
                                  ? 'bg-ink-600'
                                  : 'bg-ink-700/50'
                              }`}
                            >
                              {done ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : unlocked ? (
                                <Icon className="w-4 h-4 text-gold-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-gold-400/40" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                                {sub.title}
                              </p>
                              <p className={`text-xs truncate ${unlocked ? 'text-gray-500' : 'text-gray-700'}`}>
                                {unlocked ? `${sub.duration} • +25 XP` : 'Finish previous lesson to unlock'}
                              </p>
                            </div>

                            {unlocked && !done && (
                              <div className="shrink-0 w-7 h-7 rounded-full gold-gradient flex items-center justify-center">
                                <Play className="w-3 h-3 text-ink-900 ml-0.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {!isLast && <div className="h-3" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lesson modal */}
      {activeLesson && (
        <LessonModal
          unit={activeLesson.unit}
          subLesson={activeLesson.sub}
          onClose={() => setActiveLesson(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
