import React, { useEffect, useState } from "react";

interface ProgressBarProps {
  width?: string;
  height?: string;
  progress?: number;
  scanning?: boolean;
  duration?: number;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  width = "100%",
  height = "2vh",
  progress = 0,
  scanning = false,
  duration = 8000,
  showPercentage = true,
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    if (!scanning) {
      setCurrentProgress(Math.min(100, Math.max(0, progress)));
      return;
    }

    setCurrentProgress(0);

    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / duration) * 100, 100);

      setCurrentProgress(Math.round(percentage));

      if (percentage >= 100) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [scanning, progress, duration]);

  return (
    <div
      className="flex items-center gap-[1vh]"
      style={{
        width
      }}
    >
      {/* Loading Bar */}
      <div
        className="flex-1 overflow-hidden rounded-full"
        style={{
          height: height,
          backgroundColor: "#D9D9D9",
        }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-100"
          style={{
            width: `${currentProgress}%`,
            backgroundColor: "#0E6528",
          }}
        />
      </div>

      {/* Percentage */}
      {showPercentage && (
        <span
          className="font-bold text-[1.8vh] min-w-[4vh] text-right"
          style={{
            color: "#0E6528",
          }}
        >
          {currentProgress}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;