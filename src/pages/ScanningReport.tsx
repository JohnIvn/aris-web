import React, { useEffect, useState } from "react";

// Assets
import DocumentIcon from "../assets/icons/docu.png";
import ScannerImage from "../assets/images/scanning.png";

// Components
import StepProgress from "../components/StepProgress";
import IconCircle from "../components/IconCircle";
import Spacer from "../components/Spacer";
import Divider from "../components/Divider";
import ScannerStatus from "../components/ScannerStatus";
import ProgressBar from "../components/ProgressBar";
import LoadingDots from "../components/LoadingDots";

export interface ScanningReportProps {
  title?: string;
  tagline?: string;
  task?: string;
  scannerImage?: string;
  accentColor?: string;
  secondaryColor?: string;

  // Called after scanning reaches 100%
  onComplete?: (success: boolean) => void;
}

export const ScanningReport: React.FC<ScanningReportProps> = ({
  title = "SCANNING REPORT",
  tagline = "Please do not remove the report.",
  task= "Digitizing your accomplishment report...",
  scannerImage = ScannerImage,
  accentColor = "#0E6528",
  secondaryColor = "#7A7F89",
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);

  /*
   * Temporary scanning simulation
   *
   * Remove this when the actual scanner hardware
   * is connected.
   */
  useEffect(() => {
    const duration = 8000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      const percentage = Math.min(
        Math.round((elapsed / duration) * 100),
        100
      );

      setProgress(percentage);

      if (percentage >= 100) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  /*
   * When progress reaches 100%,
   * determine whether the scan succeeded.
   *
   * TEMPORARY:
   * true = success
   * false = failure
   *
   * Replace this with the actual scanner result
   * once hardware is connected.
   * 
   * Basta kayo na bahala HAHAHA
   */
  useEffect(() => {
    if (progress !== 100) return;

    const success = true;

    onComplete?.(success);
  }, [progress, onComplete]);

  return (
    <>
      {/* Step Progress */}
      <div className="absolute top-[7vh] left-1/2 -translate-x-1/2">
        <StepProgress
          steps={3}
          currentStep={2}
        />
      </div>

      {/* Scanning Content */}
      <section className="flex flex-col justify-center items-center">

        {/* Document Icon */}
        <IconCircle
          size="19.12vh"
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

        {/* Scanning Report */}
        <h1
          className="leading-none text-[5.21vh] font-extrabold"
          style={{ color: accentColor }}
        >
          {title}
        </h1>

        <Spacer size={2} />

        {/* Tagline */}
        <p
          className="w-[44.53vh] leading-4 text-[2.47vh] font-normal text-center tracking-1"
          style={{ color: secondaryColor }}
        >
          {tagline}
        </p>

        <Spacer size={6} />

        {/* Progress Bar */}
        <ProgressBar
          width="80vh"
          height="2.1vh"
          progress={progress}
        />

        <p 
          className="text-[1.9531vh] leading-none tracking-1  "
          style= {{ color: secondaryColor }}
        >
          {task}
        </p>

        <Spacer size={10} />

        <LoadingDots />

        <Spacer size={10} />

        {/* Scanner Image */}
        <img
          src={scannerImage}
          alt="Scanning report"
          className="w-[46.61vh] h-auto"
        />

        <Spacer size={12} />

        {/* Scanner Status */}
        <ScannerStatus
          status="scanning"
          title="Scanning in process..."
          message="Keep the report flat and properly aligned."
        />

      </section>
    </>
  );
};

export default ScanningReport;