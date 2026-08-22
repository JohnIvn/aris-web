import React, { useEffect, useState } from "react";

/**
 * Props for the Header component.
 * Every visual piece (logo, name, tagline, clock, accent color) is
 * overridable so this header can be reused across different screens/apps.
 */
export interface HeaderProps {
  /** Custom logo element (SVG/icon). Ignored if `logoImageSrc` is provided. */
  logoIcon?: React.ReactNode;
  /** URL/path to a logo image. Takes priority over `logoIcon`. */
  logoImageSrc?: string;
  /** Main brand/app name shown next to the logo. */
  appName?: string;
  /** Small uppercase tagline under/next to the app name. Use "\n" for a line break. */
  tagline?: string;
  /** Fixed time string to display. If omitted, a live clock is shown. */
  time?: string;
  /** Whether to render the clock at all. */
  showClock?: boolean;
  /** Format options passed to `toLocaleTimeString` for the live clock. */
  clockOptions?: Intl.DateTimeFormatOptions;
  /** Called when the info icon is clicked. */
  onInfoClick?: () => void;
  /** Whether to show the info icon button. */
  showInfoButton?: boolean;
  /** Primary accent color (logo tile, app name, border, info icon). */
  accentColor?: string;
  /** Header background color. */
  backgroundColor?: string;
  /** Bottom border color. Defaults to `accentColor`. */
  borderColor?: string;
  /** Text color for the tagline. */
  taglineColor?: string;
  /** Text color for the clock. */
  clockColor?: string;
  /** Extra classes appended to the root <header>. */
  className?: string;
}

const DefaultLogoGlyph: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2 15 6.5 19 4 17 9 22 12 17 15 19 20 15 17.5 12 22 9 17.5 5 20 7 15 2 12 7 9 5 4 9 6.5 12 2Z"
      fill="white"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  logoIcon,
  logoImageSrc,
  appName = "ARIS",
  tagline = "ACCOMPLISH REPORT\n& IDENTITY SYSTEM",
  time,
  showClock = true,
  clockOptions = { hour: "numeric", minute: "2-digit", hour12: true },
  onInfoClick,
  showInfoButton = true,
  accentColor = "#E8752C",
  backgroundColor = "#050808",
  borderColor,
  taglineColor = "#8a8a8a",
  clockColor = "#B8B8B8",
  className = "",
}) => {
  const [clock, setClock] = useState(time ?? "");

  useEffect(() => {
    if (time || !showClock) return;
    const update = () =>
      setClock(
        new Date()
          .toLocaleTimeString([], clockOptions)
          .replace(/am|pm/i, (match) => match.toUpperCase())
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [time, showClock]);

  return (
    <header
      className={`flex z-1 items-center justify-between px-6 py-3 
        ${borderColor ? "border-b-2" : "border-0"} ${className}`}
      style={{ backgroundColor, borderColor }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-md shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          {logoImageSrc ? (
            <img
              src={logoImageSrc}
              alt={`${appName} logo`}
              className="w-6 h-6 object-contain"
            />
          ) : (
            (logoIcon ?? <DefaultLogoGlyph />)
          )}
        </div>

        <span
          className="text-xl font-extrabold tracking-wide leading-none"
          style={{ color: accentColor }}
        >
          {appName}
        </span>

        {tagline && (
          <>
            <div className="w-px h-8 bg-white/15 mx-1 shrink-0" />
            <div
              className="text-[10px] leading-tight uppercase tracking-wider whitespace-pre-line"
              style={{ color: taglineColor }}
            >
              {tagline}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showClock && (
          <span
            className="sm-text-2xl text-base  font-base tabular-nums"
            style={{ color: clockColor }}
          >
            {clock}
          </span>
        )}

        {showInfoButton && (
          <button
            type="button"
            onClick={onInfoClick}
            aria-label="Information"
            className="flex items-center justify-center w-7 h-7 rounded-full border transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <line x1="12" y1="25" x2="12" y2="12" />
              <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
