import React from "react";

// Assets
import DocumentIcon from "../assets/icons/docu.png";
import SuccessImage from "../assets/images/success.png";

// Components
import StepProgress from "../components/StepProgress";
import IconCircle from "../components/IconCircle";
import Spacer from "../components/Spacer";
import Divider from "../components/Divider";

export interface SuccessReportProps {
  title?: string;
  tagline?: string;
  image?: string;
  accentColor?: string;
  secondaryColor?: string;
  onContinue?: () => void;
}

export const SuccessReport: React.FC<SuccessReportProps> = ({
  title = "SCAN ACCOMPLISHMENT REPORT",
  tagline = "Success your accomplishment report on the scanner",
  image = SuccessImage,
  accentColor = "#0E6528",
  secondaryColor = "#7A7F89",
  onContinue
}) => {
  const handleContinue = () => {
    // Detect document from scanner hardware

    onContinue?.();

    // Once we have hardware
  };

  return (
    <>
      {/* Step Progress */}
      <div className="absolute top-[7vh] left-1/2 -translate-x-1/2">
        <StepProgress
          steps={3}
          currentStep={1}
        />
      </div>

      {/* Scan Icon */}
      <section className="flex flex-col justify-center items-center">
        <IconCircle
          size={"19.12vh"}
          shadow
          shadowOffsetY={4}
          shadowBlur={40}
          shadowSpread={3}
        >
          <img
            src={DocumentIcon}
            alt="Document Icon"
            className="w-[12vh] h-auto"
          />
        </IconCircle>

        <Spacer size={21} />

        <h1
          className="leading-none text-[5.21vh] font-extrabold"
          style={{ color: accentColor }}
        >
          {title}
        </h1>

        <Spacer size={2} />

        <p
          className="w-[44.53vh] leading-4 text-[2.47vh] font-normal text-center tracking-1"
          style={{ color: secondaryColor }}
        >
          {tagline}
        </p>

        <Spacer size={6} />

        <Divider />

        <img
          src={image}
          className="w-[46.61vh] h-auto"
        />

      </section>
    </>
  );
};

export default SuccessReport;