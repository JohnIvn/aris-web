import React from "react";

// Assets
import FailureImage from "../assets/images/Failure.png";
import ErrorFile from "../assets/images/error-file.png";
import RejectIcon from "../assets/icons/reject.png";
import RetryIcon from "../assets/icons/try-again.png";
import HomeIcon from "../assets/icons/home.png";
import WarningIcon from "../assets/icons/warning.png";

// Components
import StepProgress from "../components/StepProgress";
import IconCircle from "../components/IconCircle";  
import Spacer from "../components/Spacer";
import Button from "../components/Button";

export interface FailureReportProps {
  title?: string;
  icon?: string;
  tagline?: string;
  image?: string;
  accentColor?: string;
  secondaryColor?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const FailureReport: React.FC<FailureReportProps> = ({
  title = "SCAN Rejected",
  icon = RejectIcon,
  tagline = "We couldn’t read your accomplishment report. Please check the document and try again.",
  image = FailureImage,
  accentColor = "#C94A4A",
  secondaryColor = "#7A7F89",
  onRetry,
  onCancel
}) => {
  return (
    <>
      {/* Step Progress */}
      <div className="absolute top-[7vh] left-1/2 -translate-x-1/2">
        <StepProgress
          steps={3}
          currentStep={1}
          highlightColor={accentColor}
        />
      </div>

      {/* Scan Icon */}
      <section className="flex flex-col justify-center items-center">
        <IconCircle
          size={"19.12vh"}
          border
          borderColor={accentColor}
          borderSize="1.1719vh"

          shadow
          shadowColor={accentColor}
          shadowOffsetY={4}
          shadowBlur={53}
          shadowSpread={-8}
        >
          <img
            src={icon}
            alt="Document Icon"
            className="w-[9.0721vh] h-auto"
          />
        </IconCircle>

        <Spacer size={21} />

        <h1
          className="leading-none text-[5.2083vh] font-extrabold uppercase"
          style={{ color: accentColor }}
        >
          {title}
        </h1>

        <Spacer size={6} />

        <p
          className="w-[45.8490vh] leading-4 text-[1.8229vh] font-normal text-center tracking-1"
          style={{ color: secondaryColor }}
        >
          {tagline}
        </p>

        <Spacer size={20} />

        <img
          src={image}
          className="w-[40.2240vh] h-auto"
        />
        
        <Spacer size={15} />
        
        {/* Possible Reason */}
        <div 
            className="px-10 py-2 flex gap-6 border rounded-[20px] items-center"
            style={{ borderColor: accentColor }}
        >
            <img
                src={WarningIcon}
                alt="Warning Icon"
                className="w-[6.0638vh] h-[6.1549vh]"
            />

            <div>
                <label
                    className="font-medium text-[2.0833vh]"
                    style={{ color: accentColor }}
                >
                    Possible Reason
                </label>
                <ul className="list-disc pl-[2vh] leading-[2.2vh] text-[1.8625vh]  text-[#7A7F89]">
                    <li>Document is blurry</li>
                    <li>Poor lighting or shadows</li>
                    <li>Document is blurry</li>
                    <li>Document is blurry</li>
                </ul>
            </div>

            <img
                src={ErrorFile}
                alt="Warning Icon"
                className="w-[11.0326vh] h-auto"
            />
        </div>
        
        <Spacer size={10} />

        <div className="flex gap-6">
            
            <Button
                className="flex items-center gap-4 border border-[#C94A4A]"
                backgroundColor="transparent"
                borderRadius="13px"
                onClick={onRetry}
                width={"33.6732vh"}
                height={"6.5833vh"}
                fontSize={"2.6042vh"}
                textColor={accentColor}
            >   
                <img 
                    src={RetryIcon}
                    alt="Try Again Icon"
                    className="w-[2.9479vh] h-auto"
                />

                <p>Try Again</p>
            </Button>

            <Button
                className="flex items-center gap-6"
                borderRadius="13px"
                onClick={onCancel}
                width={"33.6732vh"}
                height={"6.5833vh"}
                fontSize={"2.6042vh"}
                backgroundColor={accentColor}
            >
                <img 
                    src={HomeIcon}
                    alt="Try Again Icon"
                    className="w-[2.9479vh] h-auto"
                />

                <p>Cancel</p>
            </Button>
        </div>

      </section>
    </>
  );
};

export default FailureReport;