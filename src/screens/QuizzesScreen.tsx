import { useState, useEffect } from 'react';
import { Check, X, RotateCcw, Trophy, ChevronRight, Award, Brain, Zap } from 'lucide-react';
import type { QuizSet } from '@/types';
import { QUIZZES } from '@/data/content';
import { Confetti } from '@/components/Confetti';
import { playSuccessSound, playWrongSound } from '@/hooks/useSoundEffects';
import { useGamification } from '@/hooks/useGamification';

export function QuizzesScreen() {
  const [activeQuiz, setActiveQuiz] = useState<QuizSet | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const { awardXP } = useGamification();

  const [celebrationXP, setCelebrationXP] = useState(25);

  const triggerCelebration = (xp: number) => {
    setCelebrationXP(xp);
    setShowConfetti(true);
    setShowXPPopup(true);
    playSuccessSound();
    awardXP(xp);
    setTimeout(() => setShowConfetti(false), 3000);
    setTimeout(() => setShowXPPopup(false), 2500);
  };

  const startQuiz = (quiz: QuizSet) => {
    setActiveQuiz(quiz);
    setQuestionIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setWasCorrect(false);
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const correct = idx === activeQuiz!.questions[questionIdx].correctIndex;
    setWasCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      triggerCelebration(25);
    } else {
      playWrongSound();
    }
    setTimeout(() => {
      if (questionIdx + 1 < activeQuiz!.questions.length) {
        setQuestionIdx(questionIdx + 1);
        setSelectedAnswer(null);
        setWasCorrect(false);
      } else {
        setFinished(true);
        setCompletedQuizzes((prev) => new Set(prev).add(activeQuiz!.id));
        if (correct) {
          setTimeout(() => {
            setShowConfetti(true);
            playSuccessSound();
            setTimeout(() => setShowConfetti(false), 3000);
          }, 200);
        }
      }
    }, 1600);
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuestionIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setWasCorrect(false);
  };

  useEffect(() => {
    return () => {
      setShowConfetti(false);
      setShowXPPopup(false);
    };
  }, []);

  if (activeQuiz) {
    const q = activeQuiz.questions[questionIdx];
    const totalQs = activeQuiz.questions.length;

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeQuiz} />

        {/* Confetti overlay */}
        <Confetti active={showConfetti} duration={3000} />

        {/* XP popup */}
        {showXPPopup && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[65] animate-slide-down pointer-events-none">
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl gold-gradient text-ink-900 font-bold text-base gold-glow-strong shadow-2xl">
              <Zap className="w-5 h-5 fill-ink-900" />
              Correct! +{celebrationXP} XP
            </div>
          </div>
        )}

        <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar bg-ink-800 sm:rounded-3xl rounded-t-3xl border border-ink-500/50 animate-slide-up">
          {finished ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full gold-gradient flex items-center justify-center mb-4 gold-glow animate-scale-in">
                <Trophy className="w-10 h-10 text-ink-900" />
              </div>
              <h2 className="text-2xl font-bold gold-text font-serif">Quiz Complete!</h2>
              <p className="text-sm text-gray-400 mt-2">{activeQuiz.title}</p>
              <div className="my-6 rounded-2xl bg-ink-700/50 border border-ink-600 p-5">
                <p className="text-4xl font-bold text-white">{score}<span className="text-gray-500 text-xl">/{totalQs}</span></p>
                <p className="text-sm text-gray-500 mt-1">
                  {score === totalQs ? 'Perfect score!' : score >= totalQs / 2 ? 'Well done!' : 'Keep practicing!'}
                </p>
              </div>
              <button
                onClick={closeQuiz}
                className="w-full py-3.5 rounded-xl gold-gradient text-ink-900 font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Back to Quizzes
              </button>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="sticky top-0 z-10 glass border-b border-ink-600/50 px-5 py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Question {questionIdx + 1} of {totalQs}</p>
                  <h3 className="text-sm font-bold text-white truncate">{activeQuiz.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20">
                  <Award className="w-3.5 h-3.5 text-gold-400" />
                  <span className="text-xs font-bold gold-text">{score}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-ink-600">
                <div className="h-full gold-gradient transition-all duration-500" style={{ width: `${((questionIdx + 1) / totalQs) * 100}%` }} />
              </div>

              {/* Question */}
              <div className="p-5">
                <p className="text-lg font-bold text-white mb-5 leading-snug">{q.question}</p>
                <div className="space-y-2.5">
                  {q.options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === q.correctIndex;
                    const showResult = selectedAnswer !== null;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={selectedAnswer !== null}
                        className={`w-full flex items-center justify-between text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                          showResult && isCorrect
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 animate-scale-in'
                            : showResult && isSelected
                            ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                            : 'border-ink-600 bg-ink-700/50 text-gray-300 hover:border-gold-400/40 hover:bg-ink-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {showResult && isCorrect && <Check className="w-4 h-4 shrink-0" />}
                        {showResult && isSelected && !isCorrect && <X className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Green success border highlight on question card */}
                {selectedAnswer !== null && wasCorrect && (
                  <div className="mt-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <p className="text-xs font-semibold text-emerald-300">Correct! Well done.</p>
                    </div>
                  </div>
                )}

                {selectedAnswer !== null && (
                  <div className="mt-4 rounded-xl bg-ink-700/50 border border-ink-600 p-3 animate-fade-in">
                    <p className="text-xs text-gray-400">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-gold-400" />
          <h1 className="text-2xl font-bold gold-text font-serif">Quizzes</h1>
        </div>
        <p className="text-sm text-gray-500">Test your knowledge and track your score.</p>
      </div>

      <div className="px-5 space-y-3">
        {QUIZZES.map((quiz) => {
          const done = completedQuizzes.has(quiz.id);
          return (
            <button
              key={quiz.id}
              onClick={() => startQuiz(quiz)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-ink-800 border border-ink-600 hover:border-gold-400/40 transition-all text-left group"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{quiz.title}</p>
                  {done && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{quiz.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ink-700 text-gray-400">{quiz.level}</span>
                  <span className="text-[10px] text-gray-600">{quiz.questions.length} questions</span>
                  <span className="text-[10px] font-semibold text-gold-400/60 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />+25 XP each
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold-400 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
