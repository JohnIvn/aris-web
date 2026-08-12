import React from "react";
import Header, { HeaderProps } from "../components/Header";
import Background from "../assets/images/background-2nd.png";
import FingerPrintIcon from "../assets/icons/fingerprint.png";

export interface LandingPageProps {
  backgroundImageSrc?: string;
  headerProps?: Partial<HeaderProps>;
  brandLetters?: string;
  eyebrow?: string;
  tagline?: string;
  description?: React.ReactNode;
  prompt?: string;
  promptHighlight?: string;
  promptSuffix?: string;
  accentColor?: string;
  onTouch?: () => void;
  className?: string;
}

const handleCTAClick = () => {
  // Handle the click event for the CTA pill here
  console.log("CTA pill clicked");
}

const IconChevron = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconAsterisk = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4v16M5 8l14 8M19 8L5 16" strokeLinecap="round" />
  </svg>
);


export const LandingPage: React.FC<LandingPageProps> = ({
  backgroundImageSrc = Background,
  headerProps,
  brandLetters = "ARIS",
  eyebrow = "Welcome to",
  tagline = "Accomplish Report & Identity System",
  description = (
    <>
      A unified system for reports, tracking, and identity management — built for{" "}
      <Highlight>accuracy</Highlight>, <Highlight>security</Highlight>, and{" "}
      <Highlight>progress</Highlight>.
    </>
  ),
  prompt = "Touch anywhere",
  promptSuffix = "to begin",
  accentColor = "#4FAE4A",
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

      <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        {/* Eyebrow with flanking lines */}
        <div className="flex items-center gap-4">
          <span className="h-px sm:w-13 w-8 bg-green-300/30" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-300">
            {eyebrow}
          </span>
          <span className="h-px sm:w-13 w-8 bg-green-300/30" />
        </div>

        {/* Wordmark */}
        <div>
          <div className="flex items-end justify-center">
            {brandLetters.split("").map((letter, i) => (
              <React.Fragment key={`${letter}-${i}`}>
                <span className="text-7xl font-extrabold tracking-tight md:text-8xl">
                  {letter}
                </span>
                {i < brandLetters.length - 1 && (
                  <span
                    aria-hidden
                    className="mx-2 mb-3 text-4xl leading-none md:mb-4 md:text-5xl"
                    style={{ color: accentColor }}
                  >
                    •
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-gray-300 md:text-base">
            {tagline}
          </p>
        </div>

        {/* Divider with asterisk */}
        <div className="flex w-full sm:max-w-xs max-w-[200px] items-center gap-2">
          <span className="h-px flex-1 bg-white/15" />
          <span style={{ color: accentColor }}>
            <IconAsterisk />
          </span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        {/* Description */}
        <p className="max-w-md text-xs leading-relaxed text-gray-300 md:text-base">
          {description}
        </p>

        {/* CTA pill */}
        <div
          className="mt-2 flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 shadow-[0_0_30px_-8px] backdrop-blur-sm cursor-pointer"
          style={{ boxShadow: `0 0 40px -12px ${accentColor}` }}
          onClick={handleCTAClick}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            <img src={FingerPrintIcon} alt="Finger Print Icon" className="w-auto h-7 opacity-80" />
          </span>
          <span className="text-left">
            <span className="block text-base font-semibold text-white">{prompt}</span>
            <span className="block text-sm text-gray-400">{promptSuffix}</span>
          </span>
          <span className="text-gray-500">
            <IconChevron />
          </span>
        </div>
      </div>
    </div>
  );
};

const Highlight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-medium" style={{ color: "#8FD97C" }}>
    {children}
  </span>
);

export default LandingPage;