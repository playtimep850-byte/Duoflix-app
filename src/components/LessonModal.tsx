import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, Check, Mic, MicOff, Camera, CameraOff, FlipHorizontal, BookOpen, PenLine, Mic2, ChevronRight, Sparkles, Square, SkipBack, SkipForward, Target, Zap, VolumeX, Maximize2 } from 'lucide-react';
import type { SubLesson, Unit } from '@/types';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { ListenButton } from '@/components/ListenButton';
import { Confetti } from '@/components/Confetti';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useCamera } from '@/hooks/useCamera';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { usePronunciation } from '@/hooks/usePronunciation';
import { playSuccessSound, playWrongSound } from '@/hooks/useSoundEffects';
import { DEFAULT_LESSON_VOICE } from '@/data/curriculum';

interface LessonModalProps {
  unit: Unit;
  subLesson: SubLesson;
  onClose: () => void;
  onComplete: () => void;
}

const CAPTIONS = [
  'Welcome to this unit. Let us begin our journey.',
  'In English, we use different tenses to describe time.',
  'Practice speaking aloud — repetition builds fluency.',
  'Notice how the speaker pauses between ideas.',
  'Great work! You are ready for the next exercise.',
];

const CAPTION_TIMESTAMPS = [0, 4, 8, 12, 16];

const READING_PASSAGE = `Every morning, Maya walks to the cafe near her office. She orders a cappuccino and a croissant, then finds a quiet corner to review her notes. The barista knows her by name and always greets her with a warm smile. "The usual, Maya?" he asks. She nods, already looking forward to the day ahead. This simple routine gives her a sense of calm before the busy hours begin.`;

const READING_QUESTIONS = [
  { q: 'What does Maya order?', options: ['Tea and toast', 'Cappuccino and croissant', 'Water and fruit', 'Black coffee'], correct: 1 },
  { q: 'How does the barista greet her?', options: ['With a wave', 'With a warm smile', 'By ignoring her', 'With a text'], correct: 1 },
  { q: 'Why does Maya visit the cafe?', options: ['To meet friends', 'To review notes and feel calm', 'To work there', 'To exercise'], correct: 1 },
];

const GRAMMAR_LESSONS = {
  default: {
    rule: 'Use the Present Simple tense for habits, routines, and general truths. Add -s to the verb for he/she/it.',
    examples: [
      'I drink coffee every morning.',
      'She works at a tech company.',
      'They play football on weekends.',
      'The sun rises in the east.',
    ],
    exercise: {
      q: 'Complete: "He ___ to the gym every day."',
      options: ['go', 'goes', 'going', 'gone'],
      correct: 1,
    },
  },
};

const PRONUNCIATION_PHRASE = 'The quick brown fox jumps over the lazy dog.';

export function LessonModal({ unit, subLesson, onClose, onComplete }: LessonModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentCaption, setCurrentCaption] = useState(0);
  const [useYouTube, setUseYouTube] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [readingAnswer, setReadingAnswer] = useState<number | null>(null);
  const [readingQIdx, setReadingQIdx] = useState(0);
  const [readingScore, setReadingScore] = useState(0);
  const [readingDone, setReadingDone] = useState(false);
  const [grammarAnswer, setGrammarAnswer] = useState<number | null>(null);
  const [grammarCorrect, setGrammarCorrect] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const mic = useMicrophone();
  const camera = useCamera();
  const speech = useSpeechSynthesis();
  const pronunciation = usePronunciation();
  const timerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const totalDuration = 20;
  const hasYouTube = !!subLesson.youtubeId;

  const [celebrationXP, setCelebrationXP] = useState(25);

  const triggerCelebration = (xp = 25) => {
    setCelebrationXP(xp);
    setShowConfetti(true);
    setShowXPPopup(true);
    playSuccessSound();
    setTimeout(() => setShowConfetti(false), 3000);
    setTimeout(() => setShowXPPopup(false), 2500);
    if (xp > 0) {
      const event = new CustomEvent('duoflix-award-xp', { detail: xp });
      window.dispatchEvent(event);
    }
  };

  useEffect(() => {
    if (isPlaying && !useYouTube) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((t) => {
          if (t >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return t + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, useYouTube]);

  useEffect(() => {
    const idx = Math.min(
      CAPTION_TIMESTAMPS.findIndex((ts) => ts > currentTime),
      CAPTIONS.length - 1,
    );
    setCurrentCaption(idx === -1 ? CAPTIONS.length - 1 : Math.max(0, idx - 1));
  }, [currentTime]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    return () => {
      mic.stopRecording();
      camera.disable();
      speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = () => {
    mic.stopRecording();
    camera.disable();
    speech.stop();
    onComplete();
  };

  const handleReadingAnswer = (idx: number) => {
    if (readingAnswer !== null) return;
    setReadingAnswer(idx);
    if (idx === READING_QUESTIONS[readingQIdx].correct) {
      setReadingScore((s) => s + 1);
      triggerCelebration(25);
    } else {
      playWrongSound();
    }
    setTimeout(() => {
      if (readingQIdx + 1 < READING_QUESTIONS.length) {
        setReadingQIdx(readingQIdx + 1);
        setReadingAnswer(null);
      } else {
        setReadingDone(true);
      }
    }, 1600);
  };

  const handleGrammarAnswer = (idx: number) => {
    if (grammarAnswer !== null) return;
    setGrammarAnswer(idx);
    const correct = idx === GRAMMAR_LESSONS.default.exercise.correct;
    setGrammarCorrect(correct);
    if (correct) {
      triggerCelebration(25);
    } else {
      playWrongSound();
    }
  };

  const handleStopRecording = () => {
    mic.stopRecording();
    setHasRecorded(true);
    setTimeout(() => {
      pronunciation.analyze('the quick brown fox jumps over the lazy dog', PRONUNCIATION_PHRASE);
    }, 300);
  };

  useEffect(() => {
    if (pronunciation.result && pronunciation.result.overallScore >= 85) {
      triggerCelebration(25);
    }
  }, [pronunciation.result]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const typeConfig = {
    video: { icon: Play, label: 'Video Lesson', color: 'text-rose-400' },
    reading: { icon: BookOpen, label: 'Reading Exercise', color: 'text-sky-400' },
    grammar: { icon: PenLine, label: 'Grammar Builder', color: 'text-emerald-400' },
    pronunciation: { icon: Mic2, label: 'Pronunciation Practice', color: 'text-amber-400' },
  };

  const cfg = typeConfig[subLesson.type];
  const TypeIcon = cfg.icon;
  const progress = (currentTime / totalDuration) * 100;

  const ytEmbedUrl = subLesson.youtubeId
    ? `https://www.youtube.com/embed/${subLesson.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1${isMuted ? '&mute=1' : ''}&cc_load_policy=${showCaptions ? 1 : 0}&cc_lang_pref=en`
    : null;

  const isVideoType = subLesson.type === 'video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in overflow-y-auto no-scrollbar">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleComplete} />

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

      {isVideoType ? (
        /* Video player modal with proper 16:9 aspect ratio */
        <div className="relative w-full max-w-lg my-auto mx-auto animate-slide-up flex flex-col items-center">
          {/* 16:9 responsive video container */}
          <div className="relative w-full aspect-video bg-black sm:rounded-t-3xl overflow-hidden sm:border sm:border-b-0 border-ink-500/50">
            {useYouTube && ytEmbedUrl ? (
              <iframe
                src={ytEmbedUrl}
                title={subLesson.title}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: 'contain' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              /* Simulated player */
              <div className="absolute inset-0 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`w-20 h-20 mx-auto rounded-full gold-gradient flex items-center justify-center mb-3 transition-transform ${isPlaying ? 'scale-100' : 'scale-90'} animate-pulse-gold`}>
                        {isPlaying ? <Pause className="w-8 h-8 text-ink-900" /> : <Play className="w-8 h-8 text-ink-900 ml-1" />}
                      </div>
                      <p className="text-xs text-gray-500">{isPlaying ? 'Now playing...' : 'Tap play to start'}</p>
                    </div>
                  </div>
                  {isPlaying && (
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-gold-400/0 via-gold-400/30 to-gold-400/0 animate-shimmer" />
                  )}
                </div>

                {/* Captions overlay */}
                {showCaptions && (
                  <div className="absolute bottom-20 left-0 right-0 px-6">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 text-center animate-fade-in" key={currentCaption}>
                      <p className="text-base text-white font-medium leading-snug">{CAPTIONS[currentCaption]}</p>
                    </div>
                  </div>
                )}

                {/* Top controls */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-4 pt-4 pb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 w-10 h-10 rounded-xl bg-ink-700/80 backdrop-blur-sm flex items-center justify-center ${cfg.color}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                      <h3 className="text-sm font-bold text-white truncate">{subLesson.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={handleComplete}
                    className="shrink-0 w-9 h-9 rounded-full bg-ink-700/80 backdrop-blur-sm hover:bg-ink-600 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-300" />
                  </button>
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pt-8 pb-4">
                  {/* Seek bar */}
                  <div className="h-1.5 rounded-full bg-white/20 mb-3 overflow-hidden cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    setCurrentTime(Math.round(pct * totalDuration));
                  }}>
                    <div className="h-full gold-gradient rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setCurrentTime((t) => Math.max(0, t - 5))} className="w-8 h-8 flex items-center justify-center">
                        <SkipBack className="w-4 h-4 text-white/80" />
                      </button>
                      <button onClick={() => setIsPlaying((p) => !p)} className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                        {isPlaying ? <Pause className="w-5 h-5 text-ink-900" /> : <Play className="w-5 h-5 text-ink-900 ml-0.5" />}
                      </button>
                      <button onClick={() => setCurrentTime((t) => Math.min(totalDuration, t + 5))} className="w-8 h-8 flex items-center justify-center">
                        <SkipForward className="w-4 h-4 text-white/80" />
                      </button>
                      <span className="text-xs text-white/80 tabular-nums ml-1">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted((m) => !m)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-white/70" />}
                      </button>
                      <button
                        onClick={() => setShowCaptions((s) => !s)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-md transition-colors ${showCaptions ? 'bg-gold-400/30 text-gold-300' : 'bg-white/10 text-white/60'}`}
                      >
                        CC
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Source toggle - top right floating */}
            {hasYouTube && (
              <div className="absolute top-16 right-3 z-10 flex gap-1.5">
                <button
                  onClick={() => setUseYouTube(true)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${useYouTube ? 'bg-gold-400/30 text-gold-300 border border-gold-400/40' : 'bg-black/50 text-white/60 border border-white/10'}`}
                >
                  YT
                </button>
                <button
                  onClick={() => { setUseYouTube(false); setIsPlaying(false); setCurrentTime(0); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${!useYouTube ? 'bg-gold-400/30 text-gold-300 border border-gold-400/40' : 'bg-black/50 text-white/60 border border-white/10'}`}
                >
                  SIM
                </button>
              </div>
            )}
          </div>

          {/* Info section below video - no overlap with player */}
          <div className="w-full px-5 py-4 bg-ink-800 sm:rounded-b-3xl border border-t-0 border-ink-500/50">
            {/* Unit context */}
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="text-lg">{unit.icon}</span>
              <span>{unit.title}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-400">{subLesson.duration}</span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-4">{subLesson.description}</p>

            {/* Live captions info */}
            <div className="rounded-xl bg-ink-700/50 border border-ink-600 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gold-400" />
                  <span className="text-sm font-semibold text-white">Audio Narration</span>
                </div>
                <button
                  onClick={() => speech.isSpeaking ? speech.stop() : speech.speak(CAPTIONS.join(' '), DEFAULT_LESSON_VOICE)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    speech.isSpeaking ? 'bg-gold-400/20 text-gold-300 border border-gold-400/40' : 'bg-ink-600 text-gold-400 hover:bg-ink-500'
                  }`}
                >
                  {speech.isSpeaking ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3" />}
                  {speech.isSpeaking ? `Speaking ${speech.currentSentenceIndex + 1}/${speech.totalSentences}` : 'Listen'}
                </button>
              </div>
              <p className="text-xs text-gray-400">Listen to the lesson narration with natural pauses between sentences.</p>
            </div>

            {/* Complete button */}
            <button
              onClick={handleComplete}
              className="w-full py-3.5 rounded-xl gold-gradient text-ink-900 font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Complete & Continue
            </button>
          </div>
        </div>
      ) : (
        /* Non-video lesson modal - standard layout */
        <div
          ref={scrollRef}
          className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar bg-ink-800 sm:rounded-3xl rounded-t-3xl border border-ink-500/50 animate-slide-up"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 glass border-b border-ink-600/50 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`shrink-0 w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center ${cfg.color}`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                <h3 className="text-sm font-bold text-white truncate">{subLesson.title}</h3>
              </div>
            </div>
            <button
              onClick={handleComplete}
              className="shrink-0 w-8 h-8 rounded-full bg-ink-700 hover:bg-ink-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="px-5 py-5">
            {/* Unit context */}
            <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
              <span className="text-lg">{unit.icon}</span>
              <span>{unit.title}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-400">{subLesson.duration}</span>
            </div>

            {/* READING EXERCISE */}
            {subLesson.type === 'reading' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-ink-700/50 border border-ink-600 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      <span className="text-sm font-semibold text-sky-400">Read the passage</span>
                    </div>
                    <ListenButton text={READING_PASSAGE} voiceProfile={DEFAULT_LESSON_VOICE} label="Listen" variant="accent" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{READING_PASSAGE}</p>
                </div>

                {!readingDone ? (
                  <div className={`rounded-2xl bg-ink-700/50 border p-5 transition-all duration-300 ${
                    readingAnswer !== null && readingAnswer === READING_QUESTIONS[readingQIdx].correct
                      ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'border-ink-600'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-500">Question {readingQIdx + 1} of {READING_QUESTIONS.length}</span>
                      <span className="text-xs text-gold-400">Score: {readingScore}</span>
                    </div>
                    <p className="text-sm font-semibold text-white mb-4">{READING_QUESTIONS[readingQIdx].q}</p>
                    <div className="space-y-2">
                      {READING_QUESTIONS[readingQIdx].options.map((opt, i) => {
                        const isSelected = readingAnswer === i;
                        const isCorrect = i === READING_QUESTIONS[readingQIdx].correct;
                        const showResult = readingAnswer !== null;
                        return (
                          <button
                            key={i}
                            onClick={() => handleReadingAnswer(i)}
                            disabled={readingAnswer !== null}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                              showResult && isCorrect
                                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 animate-scale-in'
                                : showResult && isSelected
                                ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                                : 'border-ink-600 bg-ink-800 text-gray-300 hover:border-gold-400/40 hover:bg-ink-700'
                            }`}
                          >
                            {opt}
                            {showResult && isCorrect && <Check className="inline w-4 h-4 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center animate-scale-in">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-lg font-bold text-white">Reading Complete!</p>
                    <p className="text-sm text-gray-400 mt-1">You scored {readingScore}/{READING_QUESTIONS.length}</p>
                  </div>
                )}
              </div>
            )}

            {/* GRAMMAR BUILDER */}
            {subLesson.type === 'grammar' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-ink-700/50 border border-ink-600 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PenLine className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">Grammar Rule</span>
                    </div>
                    <ListenButton text={GRAMMAR_LESSONS.default.rule} voiceProfile={DEFAULT_LESSON_VOICE} label="Listen" variant="accent" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{GRAMMAR_LESSONS.default.rule}</p>
                </div>

                <div className="rounded-2xl bg-ink-700/50 border border-ink-600 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Examples</span>
                    <ListenButton text={GRAMMAR_LESSONS.default.examples.join('. ')} voiceProfile={DEFAULT_LESSON_VOICE} label="Hear All" variant="compact" />
                  </div>
                  <div className="space-y-2">
                    {GRAMMAR_LESSONS.default.examples.map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-gold-400 font-bold shrink-0">{i + 1}.</span>
                        <span className="flex-1">{ex}</span>
                        <ListenButton text={ex} voiceProfile={DEFAULT_LESSON_VOICE} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`rounded-2xl bg-ink-700/50 border p-5 transition-all duration-300 ${
                  grammarAnswer !== null && grammarCorrect
                    ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'border-ink-600'
                }`}>
                  <span className="text-sm font-semibold text-white mb-3 block">Practice Exercise</span>
                  <p className="text-sm text-gray-300 mb-4">{GRAMMAR_LESSONS.default.exercise.q}</p>
                  <div className="space-y-2">
                    {GRAMMAR_LESSONS.default.exercise.options.map((opt, i) => {
                      const isSelected = grammarAnswer === i;
                      const isCorrect = i === GRAMMAR_LESSONS.default.exercise.correct;
                      const showResult = grammarAnswer !== null;
                      return (
                        <button
                          key={i}
                          onClick={() => handleGrammarAnswer(i)}
                          disabled={grammarAnswer !== null}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                            showResult && isCorrect
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 animate-scale-in'
                              : showResult && isSelected
                              ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                              : 'border-ink-600 bg-ink-800 text-gray-300 hover:border-gold-400/40 hover:bg-ink-700'
                          }`}
                        >
                          {opt}
                          {showResult && isCorrect && <Check className="inline w-4 h-4 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                  {grammarAnswer !== null && (
                    <p className={`text-xs mt-3 ${grammarCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {grammarCorrect ? 'Correct! Great job.' : 'Not quite. The correct answer is "' + GRAMMAR_LESSONS.default.exercise.options[GRAMMAR_LESSONS.default.exercise.correct] + '".'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* PRONUNCIATION PRACTICE */}
            {subLesson.type === 'pronunciation' && (
              <div className="space-y-4">
                {/* Camera mirror */}
                <div className="rounded-2xl overflow-hidden bg-ink-900 border border-ink-600 relative aspect-video">
                  {camera.isOn && camera.stream ? (
                    <>
                      <video
                        ref={camera.videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${camera.isMirrored ? 'scale-x-[-1]' : ''}`}
                      />
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                        <span className="text-xs text-white font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                          Camera Live
                        </span>
                      </div>
                      <button
                        onClick={camera.toggleMirror}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <FlipHorizontal className="w-4 h-4 text-white" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Camera className="w-10 h-10 text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500 mb-3">Camera is off</p>
                      <button
                        onClick={camera.enable}
                        className="px-4 py-2 rounded-xl bg-ink-700 hover:bg-ink-600 text-xs font-medium text-gray-300 transition-colors"
                      >
                        Enable Camera
                      </button>
                    </div>
                  )}
                  {camera.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink-900/90">
                      <p className="text-xs text-rose-400 px-4 text-center">{camera.error}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={camera.isOn ? camera.disable : camera.enable}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      camera.isOn
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                        : 'border-ink-600 bg-ink-700 text-gray-300 hover:border-gold-400/40'
                    }`}
                  >
                    {camera.isOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                    {camera.isOn ? 'Stop Camera' : 'Start Camera'}
                  </button>
                  {camera.isOn && (
                    <button
                      onClick={camera.toggleMirror}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                        camera.isMirrored ? 'border-gold-400/40 bg-gold-400/10 text-gold-300' : 'border-ink-600 bg-ink-700 text-gray-300'
                      }`}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      Mirror
                    </button>
                  )}
                </div>

                {/* Speech practice card */}
                <div className="rounded-2xl bg-gradient-to-br from-ink-700/60 to-ink-800 border border-ink-600 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Mic2 className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">Tap to Speak</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Listen to the phrase, then speak it back. Get instant feedback on your pronunciation.</p>

                  <div className="rounded-xl bg-ink-900/60 border border-ink-600/50 px-4 py-3 mb-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-white font-medium text-center italic flex-1">"{PRONUNCIATION_PHRASE}"</p>
                      <ListenButton text={PRONUNCIATION_PHRASE} voiceProfile={DEFAULT_LESSON_VOICE} variant="compact" />
                    </div>
                  </div>

                  <div className="flex justify-center mb-4">
                    <ListenButton text={PRONUNCIATION_PHRASE} voiceProfile={DEFAULT_LESSON_VOICE} label="Listen before you speak" variant="accent" />
                  </div>

                  {/* Visualizer */}
                  <div className="mb-4">
                    <AudioVisualizer levels={mic.audioLevels} active={mic.isRecording} />
                  </div>

                  {/* Mic button */}
                  <div className="flex justify-center mb-3">
                    <button
                      onClick={mic.isRecording ? handleStopRecording : mic.startRecording}
                      disabled={!mic.isSupported}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        mic.isRecording
                          ? 'bg-rose-500 animate-pulse-gold scale-110'
                          : 'gold-gradient hover:scale-105'
                      } ${!mic.isSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {mic.isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-ink-900" />}
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-500 mb-3">
                    {!mic.isSupported
                      ? 'Microphone not supported on this device.'
                      : mic.error
                      ? mic.error
                      : mic.isRecording
                      ? 'Listening... Tap to stop and analyze.'
                      : hasRecorded
                      ? 'Tap the mic to try again.'
                      : 'Tap the microphone to start speaking.'}
                  </p>

                  {/* Pronunciation feedback */}
                  {pronunciation.isAnalyzing && (
                    <div className="rounded-xl bg-ink-900/60 border border-gold-400/20 p-4 text-center animate-fade-in">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-gold-400 animate-pulse" />
                        <span className="text-sm font-semibold text-gold-300">Analyzing your speech...</span>
                      </div>
                    </div>
                  )}

                  {pronunciation.result && !pronunciation.isAnalyzing && (
                    <div className={`rounded-xl bg-ink-900/60 border p-4 animate-scale-in transition-all duration-300 ${
                      pronunciation.result.overallScore >= 85
                        ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'border-ink-600/50'
                    }`}>
                      {/* Score */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-gold-400" />
                          <span className="text-sm font-semibold text-white">Accuracy Score</span>
                        </div>
                        <div className={`text-2xl font-bold tabular-nums ${
                          pronunciation.result.overallScore >= 85 ? 'text-emerald-400' :
                          pronunciation.result.overallScore >= 60 ? 'text-gold-400' : 'text-rose-400'
                        }`}>
                          {pronunciation.result.overallScore}%
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="h-2 rounded-full bg-ink-600 overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            pronunciation.result.overallScore >= 85 ? 'bg-emerald-400' :
                            pronunciation.result.overallScore >= 60 ? 'gold-gradient' : 'bg-rose-400'
                          }`}
                          style={{ width: `${pronunciation.result.overallScore}%` }}
                        />
                      </div>

                      {/* Word-by-word feedback */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {pronunciation.result.words.map((w, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              w.correct
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                            }`}
                          >
                            {w.word}
                          </span>
                        ))}
                      </div>

                      {/* Feedback message */}
                      <p className="text-xs text-gray-400 leading-relaxed">{pronunciation.result.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-gold-400/5 border border-gold-400/20 p-4 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">Use the camera mirror to practice your body language and facial expressions while speaking. Confidence is as important as pronunciation.</p>
                </div>
              </div>
            )}

            {/* Complete button */}
            <button
              onClick={handleComplete}
              className="w-full mt-2 py-3.5 rounded-xl gold-gradient text-ink-900 font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Complete & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
