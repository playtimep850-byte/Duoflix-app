import { useEffect, useState, useRef } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'rect';
}

interface ConfettiProps {
  active: boolean;
  pieceCount?: number;
  duration?: number;
}

const COLORS = ['#D4AF37', '#E0C450', '#F5EBC0', '#B8932B', '#ECD98A', '#FBF6E3'];
const SHAPES: Array<'circle' | 'square' | 'rect'> = ['circle', 'square', 'rect'];

export function Confetti({ active, pieceCount = 80, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 30,
      y: 30 + Math.random() * 10,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: Math.random() * 3 + 2,
      rotationSpeed: (Math.random() - 0.5) * 15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 6 + 4,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }));

    setPieces(newPieces);
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > duration) {
        setPieces([]);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        return;
      }

      setPieces((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.velocityX,
          y: p.y + p.velocityY,
          velocityY: p.velocityY + 0.15,
          rotation: p.rotation + p.rotationSpeed,
        })),
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, pieceCount, duration]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {pieces.map((p) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.shape === 'rect' ? `${p.size * 0.6}px` : `${p.size}px`,
          height: p.shape === 'rect' ? `${p.size * 1.5}px` : `${p.size}px`,
          backgroundColor: p.color,
          transform: `rotate(${p.rotation}deg)`,
          borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '1px',
          opacity: Math.max(0, 1 - (Date.now() - startTimeRef.current) / duration),
        };
        return <div key={p.id} style={style} />;
      })}
    </div>
  );
}
