import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  stream: MediaStream | null;
  isSupported: boolean;
  isOn: boolean;
  isMirrored: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  toggleMirror: () => void;
  enable: () => Promise<void>;
  disable: () => void;
}

export function useCamera(): UseCameraReturn {
  const [isOn, setIsOn] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const disable = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
    setIsOn(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const enable = useCallback(async () => {
    if (!isSupported) {
      setError('Camera is not supported on this device.');
      return;
    }
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(s);
      setIsOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to access camera';
      if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
        setError('Camera access denied. Please allow camera permissions.');
      } else if (msg.includes('NotFound')) {
        setError('No camera found on this device.');
      } else {
        setError('Could not start camera. Please try again.');
      }
    }
  }, [isSupported]);

  const toggleMirror = useCallback(() => setIsMirrored((m) => !m), []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  return { stream, isSupported, isOn, isMirrored, error, videoRef, toggleMirror, enable, disable };
}
