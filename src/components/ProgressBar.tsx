import React from "react";

type ProgressBarProps = {
  value: number; // 0..100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

// UI-only progress bar from 0 to 100%
export default function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const heightClasses: Record<NonNullable<ProgressBarProps["size"]>, string> = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  // Define dynamic bar color based on progress
  // 0-24: red, 25-49: orange, 50-74: amber, 75-89: lime, 90-99: green, 100: green (stronger)
  const barColor =
    clamped >= 100
      ? "bg-green-600"
      : clamped >= 90
      ? "bg-green-500"
      : clamped >= 75
      ? "bg-lime-500"
      : clamped >= 50
      ? "bg-amber-500"
      : clamped >= 25
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
          <span>Progresso</span>
          <span>{clamped}%</span>
        </div>
      )}

      <div
        className={`relative w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800 ${heightClasses[size]}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div
          className={`h-full transition-[width] duration-300 ease-out ${barColor} transition-colors`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
