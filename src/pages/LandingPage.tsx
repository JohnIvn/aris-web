import React from "react";
// Assets
import UniversityLogo from "../assets/images/UCC-logo.png";
import FingerPrintIcon from "../assets/images/finger.png";

// Components
import Spacer from "../components/Spacer";

const fingerprintCircleBase = "aspect-square rounded-full border-[0.5px]";

export interface LandingPageProps {
  backgroundImageSrc?: string;
  brandLetters?: string;
  eyebrow?: string;
  tagline?: string;
  highlightedLetters?: string[];
  promptTop?: string;
  promptHighlight?: string;
  promptBottom?: string;
  accentColor?: string;
  secondaryAccentColor?: string;
  borderColor?: string;
  onTouch?: () => void;
  className?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  brandLetters = "A.R.I.S",
  eyebrow = "Welcome to",
  tagline = "Accomplishment Report and Identity System",
  highlightedLetters = ["A", "R", "I", "S"],
  promptTop = "Touch",
  promptHighlight = "Anywhere",
  promptBottom = "to begin",
  accentColor = "#037636",
  secondaryAccentColor = "#7A7F89",
  borderColor = "#CECECE",
  onTouch,
  className = "",
}) => {
  const fingerprintCircles = [
    {
      id: "outer",
      size: "w-[32.8175vh]",
      borderColor,
      absolute: false,
    },
    {
      id: "middle",
      size: "w-[25.0885vh]",
      borderColor,
      absolute: true,
    },
    {
      id: "accent",
      size: "w-[16.4102vh]",
      borderColor: "#4FAE4A",
      backgroundColor: "#F8F7F7",
      absolute: true,
    },
    {
      id: "inner",
      size: "w-[13.4102vh]",
      borderColor: "#E9E9E9",
      shadow: true,
      absolute: true,
    },
  ];

  const formattedTagline = tagline.split("").map((char, index) => {
    return (
      <span
        key={index}
        style={{
          color: highlightedLetters.includes(char)
            ? accentColor
            : secondaryAccentColor
        }}
      >
        {char}
      </span>
    )
  });

  return (
    <div
      onClick={onTouch}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onTouch?.();
        }
      }}
      role="button"
      tabIndex={0}
      className={`relative flex h-screen w-full flex-col items-center justify-center ${className}`}
    >

      {/* Branding */}
      <section className="flex flex-col items-center justify-center text-center px-4">

        {/* University Logo */}
        <img
          src={UniversityLogo}
          alt="University Logo"
          className="w-[24.479vh] h-auto"
        />

        <Spacer size={25} />

        <p className="text-[3.125vh] leading-none tracking-[0.08em] font-light text-black/53 uppercase">
          {eyebrow}
        </p>

        <Spacer size={7} />

        <h1
          className="text-[7.8125vh] w-fit font-black tracking-[0.37em] -mr-[0.37em] text-center leading-none"
          style={{ color: accentColor }}
        >
          {brandLetters}
        </h1>

        <Spacer size={7} />

        <p className="text-[2.0833vh] leading-none tracking-[0.02em] -mr-[0.02em] text-center font-medium">
          {formattedTagline}
        </p>
      </section>

      {/* Spacer or similar to divider */}
      <Spacer size={32} />

      {/* Fingerprint Icon */}
      <section className="relative flex items-center justify-center">
        {fingerprintCircles.map((circle) => (
          <div
            key={circle.id}
            className={`
              ${fingerprintCircleBase}
              ${circle.size}
              ${circle.absolute ? "absolute" : ""}
              ${circle.shadow
                ? "shadow-[1px_1px_5px_2px_rgba(0,0,0,0.25)]"
                : ""}
            `}
            style={{
              borderColor: circle.borderColor,
              backgroundColor: circle.backgroundColor,
            }}
          />
        ))}

        <img
          src={FingerPrintIcon}
          alt="Fingerprint"
          aria-hidden="true"
          className="absolute w-[5.9466vh] h-auto"
        />
      </section>

      <Spacer size={32} />

      <section className="flex flex-col justify-center items-center">
        <span className="text-[2.6042vh] font-medium leading-none uppercase">
          <span style={{ color: secondaryAccentColor }}>
            {promptTop}{" "}
          </span>

          <span style={{ color: accentColor }}>
            {promptHighlight}{" "}
          </span>

          <span style={{ color: secondaryAccentColor }}>
            {promptBottom}
          </span>
        </span>

        <span
          className="text-[3.90625vh] leading-none rotate-90 -tracking-[0.31em]"
          style={{ color: accentColor }}
        >
          {">>"}
        </span>
      </section>
    </div>
  );
};

export default LandingPage;