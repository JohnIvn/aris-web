import React from "react";

// Assets
import FingerIcon from "../assets/images/finger.png";
import ScannerImage from "../assets/images/finger-scanner.png";

// Components
import StepProgress from "../components/StepProgress";
import IconCircle from "../components/IconCircle";
import Spacer from "../components/Spacer";
import Divider from "../components/Divider";
import ScannerStatus from "../components/ScannerStatus";

export interface ScanReportProps {
  title?: string;
  icon?: string;
  tagline?: string;
  scannerImage?: string;
  accentColor?: string;
  secondaryColor?: string;
  onScan?: () => void;
}

export const ScanReport: React.FC<ScanReportProps> = ({
  title = "SCAN ACCOMPLISHMENT REPORT",
  icon = FingerIcon,
  tagline = "Scan your accomplishment report on the scanner",
  scannerImage = ScannerImage,
  accentColor = "#0E6528",
  secondaryColor = "#7A7F89",
  onScan
}) => {
  const handleScan = () => {
    // Detect document from scanner hardware

    onScan?.();

    // Once we have hardware
  };

  return (
    <>
      {/* Step Progress */}
      <div className="absolute top-[7vh] left-1/2 -translate-x-1/2">
        <StepProgress
          steps={3}
          currentStep={2}
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
            src={icon}
            alt="Document Icon"
            className="w-[9.2682vh] h-auto"
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

        <Spacer size={6} />

        <img
          src={scannerImage}
          className="w-[35.6771vh] h-auto"
        />

        <Spacer size={12} />

        <ScannerStatus
          status="waiting"
          title="Waiting for report..."
          message="Please Scan the report on the scanner."
        />
      </section>
    </>
  );
};

export default ScanReport;