import React from "react";
import Header, { HeaderProps } from "../components/Header";

export interface LandingPageProps {
  backgroundImageSrc?: string;
  headerProps?: Partial<HeaderProps>;
  brandLetters?: string;
  greeting?: string;
  prompt?: string;
  promptHighlight?: string;
  promptSuffix?: string;
  accentColor?: string;
  onTouch?: () => void;
  className?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  backgroundImageSrc,
  headerProps,
  brandLetters = "ARIS",
  greeting = "Welcome to",
  prompt = "Touch",
  promptHighlight = "anywhere",
  promptSuffix = "to begin.",
  accentColor = "#E8752C",
  onTouch,
  className = "",
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTouch}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTouch?.()}
      className={`relative flex h-screen w-full select-none flex-col overflow-hidden bg-[#0d0d0d] text-white ${className}`}
      style={
        backgroundImageSrc
          ? {
              backgroundImage: `url(${backgroundImageSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <Header accentColor={accentColor} {...headerProps} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-lg tracking-wide text-gray-400">{greeting}</p>

        <div className="flex items-end">
          {brandLetters.split("").map((letter, i) => (
            <React.Fragment key={`${letter}-${i}`}>
              <span className="text-6xl font-extrabold tracking-tight md:text-7xl">
                {letter}
              </span>
              {i < brandLetters.length - 1 && (
                <span
                  aria-hidden
                  className="mx-2 mb-2 text-4xl font-bold leading-none md:text-5xl"
                  style={{ color: accentColor }}
                >
                  .
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        <p className="mt-8 text-sm tracking-wide text-gray-400">
          {prompt} <span style={{ color: accentColor }}>{promptHighlight}</span>{" "}
          {promptSuffix}
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
