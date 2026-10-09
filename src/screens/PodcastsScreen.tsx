import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, Clock, ChevronRight, Headphones, SkipBack, SkipForward } from 'lucide-react';
import type { PodcastItem } from '@/types';
import { PODCASTS } from '@/data/content';

export function PodcastsScreen() {
  const [activePod, setActivePod] = useState<PodcastItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const totalSeconds = 120; // simulated

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setProgress((p) => {
          if (p >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return p + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const openPodcast = (pod: PodcastItem) => {
    setActivePod(pod);
    setProgress(0);
    setIsPlaying(false);
  };

  const closePodcast = () => {
    setActivePod(null);
    setIsPlaying(false);
    setProgress(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (activePod) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closePodcast} />
        <div className="relative w-full sm:max-w-lg bg-ink-800 sm:rounded-3xl rounded-t-3xl border border-ink-500/50 animate-slide-up overflow-hidden">
          {/* Cover art */}
          <div className="relative h-48 bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center">
            <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-gold-400/0 via-gold-400/30 to-gold-400/0 animate-shimmer" />
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-400/30 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <Headphones className="w-10 h-10 text-gold-400" />
            </div>
          </div>

          <div className="p-6">
            <span className="text-xs font-semibold text-gold-400">{activePod.topic}</span>
            <h2 className="text-xl font-bold text-white mt-1">{activePod.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{activePod.host}</p>

            {/* Progress */}
            <div className="mt-6">
              <div className="h-1.5 rounded-full bg-ink-600 overflow-hidden">
                <div className="h-full gold-gradient rounded-full transition-all duration-300" style={{ width: `${(progress / totalSeconds) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-500 tabular-nums">{formatTime(progress)}</span>
                <span className="text-xs text-gray-500 tabular-nums">{formatTime(totalSeconds)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center hover:scale-105 transition-transform gold-glow"
              >
                {isPlaying ? <Pause className="w-7 h-7 text-ink-900" /> : <Play className="w-7 h-7 text-ink-900 ml-1" />}
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-5 leading-relaxed">{activePod.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Mic className="w-5 h-5 text-gold-400" />
          <h1 className="text-2xl font-bold gold-text font-serif">Podcasts</h1>
        </div>
        <p className="text-sm text-gray-500">Listen and improve your English on the go.</p>
      </div>

      <div className="px-5 space-y-3">
        {PODCASTS.map((pod) => (
          <button
            key={pod.id}
            onClick={() => openPodcast(pod)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-ink-800 border border-ink-600 hover:border-gold-400/40 transition-all text-left group"
          >
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400/15 to-gold-600/5 border border-gold-400/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Headphones className="w-6 h-6 text-gold-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-400/70">{pod.topic}</span>
              <p className="text-sm font-bold text-white truncate mt-0.5">{pod.title}</p>
              <p className="text-xs text-gray-500 truncate">{pod.host}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{pod.duration}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
