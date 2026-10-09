interface AudioVisualizerProps {
  levels: number[];
  active: boolean;
  barCount?: number;
}

export function AudioVisualizer({ levels, active, barCount = 24 }: AudioVisualizerProps) {
  const displayLevels = active ? levels : Array(barCount).fill(0.08);

  return (
    <div className="flex items-end justify-center gap-[3px] h-16 w-full">
      {displayLevels.map((level, i) => {
        const height = Math.max(4, level * 64);
        const isCenter = i >= barCount * 0.3 && i <= barCount * 0.7;
        return (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-75 ${
              active ? 'gold-gradient' : 'bg-ink-500'
            }`}
            style={{
              height: `${height}px`,
              opacity: active ? (isCenter ? 1 : 0.6 + level * 0.4) : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}
