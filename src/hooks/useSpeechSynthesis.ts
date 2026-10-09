import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceProfile } from '@/types';

interface UseSpeechSynthesisReturn {
  speak: (text: string, profile?: VoiceProfile) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voicesReady: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
}

function matchVoice(profile: VoiceProfile, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const langPrefix = profile.lang.split('-')[0];
  const langMatches = voices.filter((v) => v.lang.startsWith(langPrefix));
  const exactMatches = voices.filter((v) => v.lang === profile.lang);

  const pool = exactMatches.length ? exactMatches : langMatches.length ? langMatches : voices;

  const genderHints: Record<string, string[]> = {
    female: ['female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'zira', 'google uk english female', 'serena', 'ava'],
    male: ['male', 'daniel', 'alex', 'rishi', 'david', 'george', 'google uk english male', 'arthur', 'oliver'],
  };

  const hints = genderHints[profile.gender] || [];
  for (const hint of hints) {
    const found = pool.find((v) => v.name.toLowerCase().includes(hint));
    if (found) return found;
  }

  return pool[0] || voices[0];
}

function splitIntoSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const parts = cleaned.match(/[^.!?]+[.!?]*\s*/g);
  if (!parts) return cleaned ? [cleaned] : [];
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [totalSentences, setTotalSentences] = useState(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const cancelledRef = useRef(false);
  const chainTimeoutRef = useRef<number | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        setVoicesReady(true);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
      if (chainTimeoutRef.current) clearTimeout(chainTimeoutRef.current);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    cancelledRef.current = true;
    if (chainTimeoutRef.current) {
      clearTimeout(chainTimeoutRef.current);
      chainTimeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentSentenceIndex(0);
    setTotalSentences(0);
  }, [isSupported]);

  const speak = useCallback(
    (text: string, profile?: VoiceProfile) => {
      if (!isSupported || !text.trim()) return;

      window.speechSynthesis.cancel();
      cancelledRef.current = false;

      const sentences = splitIntoSentences(text);
      if (sentences.length === 0) return;

      setTotalSentences(sentences.length);
      setCurrentSentenceIndex(0);
      setIsSpeaking(true);

      const speakSentence = (index: number) => {
        if (cancelledRef.current) return;
        if (index >= sentences.length) {
          setIsSpeaking(false);
          setCurrentSentenceIndex(0);
          setTotalSentences(0);
          return;
        }

        setCurrentSentenceIndex(index);
        const sentence = sentences[index];
        const utterance = new SpeechSynthesisUtterance(sentence);

        if (profile) {
          const voice = matchVoice(profile, voicesRef.current);
          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
          } else {
            utterance.lang = profile.lang;
          }
          utterance.rate = profile.rate;
          utterance.pitch = profile.pitch;
          utterance.volume = profile.volume;
        }

        const isQuestion = /\?\s*$/.test(sentence);
        const isExclamation = /!\s*$/.test(sentence);
        if (isQuestion) {
          utterance.pitch = (profile?.pitch ?? 1) * 1.15;
        } else if (isExclamation) {
          utterance.pitch = (profile?.pitch ?? 1) * 1.1;
          utterance.rate = (profile?.rate ?? 1) * 1.05;
        }

        utterance.onend = () => {
          if (cancelledRef.current) return;
          const pauseMs = isQuestion ? 450 : sentence.endsWith('.') ? 350 : 200;
          chainTimeoutRef.current = window.setTimeout(() => speakSentence(index + 1), pauseMs);
        };

        utterance.onerror = () => {
          if (cancelledRef.current) return;
          setIsSpeaking(false);
          setCurrentSentenceIndex(0);
          setTotalSentences(0);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakSentence(0);
    },
    [isSupported],
  );

  return { speak, stop, isSpeaking, isSupported, voicesReady, currentSentenceIndex, totalSentences };
}
