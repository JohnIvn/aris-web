import React from "react";

interface LoadingDotsProps {
  size?: string;
  gap?: string;
  duration?: number;
  lightColor?: string;
  darkColor?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "0.8vh",
  gap = "1.2vh",
  duration = 1200,
  lightColor = "#B6D9B7",
  darkColor = "#6EB378",
}) => {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        gap,
      }}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: lightColor,
            animation: `loadingDot ${duration}ms ease-in-out infinite`,
            animationDelay: `${index * (duration / 3)}ms`,
          }}
        />
      ))}

      <style>
        {`
          @keyframes loadingDot {
            0%, 100% {
              background-color: ${lightColor};
              transform: scale(1);
            }

            50% {
              background-color: ${darkColor};
              transform: scale(1.15);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingDots;