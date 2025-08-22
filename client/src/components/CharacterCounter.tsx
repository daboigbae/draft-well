import { useMemo } from "react";

interface CharacterCounterProps {
  text: string;
  maxLength: number;
  warningThreshold?: number;
  showProgressBar?: boolean;
  showWordCount?: boolean;
}

export default function CharacterCounter({
  text,
  maxLength,
  warningThreshold = 0.8,
  showProgressBar = true,
  showWordCount = true,
}: CharacterCounterProps) {
  const stats = useMemo(() => {
    const length = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const percentage = (length / maxLength) * 100;
    const isWarning = length >= maxLength * warningThreshold;
    const isError = length >= maxLength;
    
    return {
      length,
      wordCount,
      percentage,
      isWarning,
      isError,
      remaining: maxLength - length,
    };
  }, [text, maxLength, warningThreshold]);

  const getProgressColor = () => {
    if (stats.isError) return "bg-red-500";
    if (stats.isWarning) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColor = () => {
    if (stats.isError) return "text-red-600";
    if (stats.isWarning) return "text-yellow-600";
    return "text-slate-600";
  };

  return (
    <div className="space-y-2" data-testid="character-counter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className={getTextColor()} data-testid="text-character-count">
            {stats.length} / {maxLength} characters
          </span>
          {showProgressBar && (
            <div className="w-48 bg-gray-200 rounded-full h-2" data-testid="progress-bar">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(stats.percentage, 100)}%` }}
              />
            </div>
          )}
          {stats.isWarning && (
            <span className={getTextColor()} data-testid="text-warning">
              {stats.isError ? "Limit exceeded" : `${stats.remaining} remaining`}
            </span>
          )}
        </div>
        
        {showWordCount && (
          <div className="text-sm text-slate-500" data-testid="text-word-count">
            {stats.wordCount} words
          </div>
        )}
      </div>
    </div>
  );
}
