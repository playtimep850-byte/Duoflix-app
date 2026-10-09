interface ProgressBarProps {
  percent: number;
  label?: string;
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-gray-400">{label}</span>
          <span className="text-xs font-bold gold-text">{percent}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-ink-600 overflow-hidden">
        <div
          className="h-full gold-gradient rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
