export interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, max = 100, showLabel = false, className = '' }: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-[#0d0d0d] rounded-full h-2 overflow-hidden border border-[#333333]">
        <div
          className="bg-white h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-[#999999] mt-1">{Math.round(percentage)}%</p>}
    </div>
  );
}
