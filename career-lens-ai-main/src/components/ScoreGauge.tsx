interface ScoreGaugeProps {
  score: number;
}

function scoreColor(score: number): string {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#f59e0b";
  if (score >= 30) return "#f97316";
  return "#dc2626";
}

function scoreLabel(score: number): string {
  if (score >= 75) return "Strong match";
  if (score >= 50) return "Fair match";
  if (score >= 30) return "Weak match";
  return "Poor match";
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const size = 168;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`Keyword match score ${score} out of 100, ${scoreLabel(score)}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-xs font-medium text-slate-400">/ 100</span>
        </div>
      </div>
      <span
        className="mt-2 pill text-white"
        style={{ backgroundColor: color }}
      >
        {scoreLabel(score)}
      </span>
    </div>
  );
}
