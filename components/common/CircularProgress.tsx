// FIX: Implemented CircularProgress component to resolve module and syntax errors.
import React from 'react';

interface CircularProgressProps {
  percentage: number;
  color: string; // e.g., 'text-primary-600'
  label: string;
  value: number;
  total: number;
  unit?: string;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  color,
  label,
  value,
  total,
  unit = '',
  size = 120,
  strokeWidth = 10,
}) => {
  const safePercentage = Math.max(0, Math.min(100, isNaN(percentage) ? 0 : percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="text-slate-200"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={color} // e.g. text-primary-600
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 0.3s ease',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-700">{Math.round(value)}{unit}</span>
            <span className="text-xs text-slate-500">/ {Math.round(total)}{unit}</span>
        </div>
      </div>
       <p className="font-semibold text-slate-600">{label}</p>
    </div>
  );
};

export default CircularProgress;
