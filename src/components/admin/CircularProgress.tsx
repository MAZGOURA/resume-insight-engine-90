import React from "react";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showPercentage?: boolean;
  valueFormatter?: (value: number) => string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = "#3b82f6", // Default to blue-500
  showPercentage = true,
  valueFormatter,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  // Format the value for display
  const formattedValue = valueFormatter
    ? valueFormatter(value)
    : showPercentage
    ? `${Math.round(percentage)}%`
    : typeof value === "number"
    ? value.toString()
    : "";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb" // gray-200
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">
            {formattedValue}
          </span>
        </div>
      </div>
    </div>
  );
};
