import { useState } from 'react';
import { Play, X, Clock, ChevronRight, Video as VideoIcon, Volume2 } from 'lucide-react';
import type { VideoItem } from '@/types';
import { VIDEOS } from '@/data/content';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { DEFAULT_LESSON_VOICE } from '@/data/curriculum';

export function VideosScreen() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const speech = useSpeechSynthesis();

  const closeVideo = () => {
    setActiveVideo(null);
    speech.stop();
  };

  if (activeVideo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
        <div className="absolute inset-0 bg-black/95" onClick={closeVideo} />

        {/* Centered video modal with proper 16:9 aspect ratio */}
        <div className="relative w-full max-w-lg mx-auto animate-scale-in flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          {/* 16:9 responsive video container */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-ink-500/50">
            {activeVideo.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&cc_load_policy=1&cc_lang_pref=en`}
                title={activeVideo.title}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: 'contain' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${activeVideo.thumbnail} flex items-center justify-center`}>
                <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center gold-glow">
                  <Play className="w-7 h-7 text-ink-900 ml-1" />
                </div>
              </div>
            )}

            {/* Close button - top right of video */}
            <button
              onClick={closeVideo}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors z-10"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Info section below video - fully visible, no overlap */}
          <div className="w-full px-5 pt-4 pb-5 bg-ink-800 rounded-b-2xl border border-t-0 border-ink-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gold-400">{activeVideo.level}</span>
              <button
                onClick={() => speech.isSpeaking ? speech.stop() : speech.speak(activeVideo.description, DEFAULT_LESSON_VOICE)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  speech.isSpeaking ? 'bg-gold-400/20 text-gold-300 border border-gold-400/40' : 'bg-ink-600 text-white/80 hover:bg-ink-500'
                }`}
              >
                <Volume2 className="w-3 h-3" />
                {speech.isSpeaking ? 'Stop' : 'Listen'}
              </button>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{activeVideo.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{activeVideo.channel}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activeVideo.duration}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{activeVideo.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <VideoIcon className="w-5 h-5 text-gold-400" />
          <h1 className="text-2xl font-bold gold-text font-serif">Videos</h1>
        </div>
        <p className="text-sm text-gray-500">Watch and learn with curated video lessons.</p>
      </div>

      {/* Featured */}
      <div className="px-5 mb-4">
        <button
          onClick={() => setActiveVideo(VIDEOS[0])}
          className="w-full relative rounded-2xl overflow-hidden aspect-video text-left group"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${VIDEOS[0].thumbnail}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider gold-text">Featured</span>
            <h2 className="text-lg font-bold text-white leading-snug mt-1">{VIDEOS[0].title}</h2>
            <p className="text-xs text-white/60 mt-1">{VIDEOS[0].channel} • {VIDEOS[0].duration}</p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full gold-gradient flex items-center justify-center group-hover:scale-110 transition-transform gold-glow">
            <Play className="w-6 h-6 text-ink-900 ml-1" />
          </div>
        </button>
      </div>

      {/* Video list */}
      <div className="px-5 space-y-3">
        {VIDEOS.slice(1).map((video) => (
          <button
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-ink-800 border border-ink-600 hover:border-gold-400/40 transition-all text-left group"
          >
            <div className={`shrink-0 w-24 h-16 rounded-xl overflow-hidden bg-gradient-to-br ${video.thumbnail} relative`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gold-400/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 text-ink-900 ml-0.5" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{video.title}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{video.channel}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ink-700 text-gray-400">{video.level}</span>
                <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{video.duration}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
