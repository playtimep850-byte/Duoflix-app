import { Volume2, Square } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type { VoiceProfile } from '@/types';

interface ListenButtonProps {
  text: string;
  voiceProfile?: VoiceProfile;
  label?: string;
  variant?: 'default' | 'compact' | 'accent';
}

export function ListenButton({ text, voiceProfile, label = 'Listen', variant = 'default' }: ListenButtonProps) {
  const { speak, stop, isSpeaking, isSupported, currentSentenceIndex, totalSentences } = useSpeechSynthesis();

  if (!isSupported) return null;

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, voiceProfile);
    }
  };

  const progressLabel = isSpeaking && totalSentences > 1
    ? `${currentSentenceIndex + 1}/${totalSentences}`
    : null;

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`shrink-0 flex items-center gap-1 rounded-lg px-2 h-8 transition-all ${
          isSpeaking ? 'bg-gold-400/20 text-gold-300 animate-pulse' : 'bg-ink-600 text-gold-400 hover:bg-ink-500'
        }`}
        title={isSpeaking ? 'Stop' : label}
      >
        {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
        {progressLabel && <span className="text-[9px] font-bold tabular-nums">{progressLabel}</span>}
      </button>
    );
  }

  if (variant === 'accent') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
          isSpeaking
            ? 'border-gold-400/50 bg-gold-400/15 text-gold-300'
            : 'border-gold-400/30 bg-gold-400/10 text-gold-300 hover:bg-gold-400/20'
        }`}
      >
        {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
        {isSpeaking ? (progressLabel ? `Speaking ${progressLabel}` : 'Stop') : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
        isSpeaking
          ? 'bg-gold-400/20 text-gold-300 border border-gold-400/40'
          : 'bg-ink-600 text-gray-300 hover:bg-ink-500 border border-ink-500'
      }`}
    >
      {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5 text-gold-400" />}
      {isSpeaking ? (progressLabel ? `${progressLabel}` : 'Stop') : label}
    </button>
  );
}
