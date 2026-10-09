import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMicrophoneReturn {
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  audioLevels: number[];
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  hasPermission: boolean | null;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(24).fill(0.1));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsRecording(false);
    setAudioLevels(Array(24).fill(0.1));
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Microphone is not supported on this device.');
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const levels: number[] = [];
        const bars = 24;
        const step = Math.floor(bufferLength / bars);
        for (let i = 0; i < bars; i++) {
          const val = dataArray[i * step] / 255;
          levels.push(Math.max(0.05, val));
        }
        setAudioLevels(levels);
        animationRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
      setIsRecording(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to access microphone';
      if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
        setError('Microphone access denied. Please allow mic permissions.');
      } else if (msg.includes('NotFound')) {
        setError('No microphone found on this device.');
      } else {
        setError('Could not start recording. Please try again.');
      }
      setHasPermission(false);
    }
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return { isRecording, isSupported, error, audioLevels, startRecording, stopRecording, hasPermission };
}
