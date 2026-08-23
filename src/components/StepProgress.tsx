import React from "react";

interface StepProgressProps {
  steps?: number;
  currentStep?: number;
  highlightColor?: string;
  normalColor?: string;
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps = 3,
  currentStep = 1,
  highlightColor = "#47BA56",
  normalColor = "#C7C7C7",
}) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: steps }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={step}>
            {/* Step Circle */}
            <div
              className="w-[1.2vh] h-[1.2vh] rounded-full"
              style={{
                backgroundColor: isActive
                  ? highlightColor
                  : normalColor,
              }}
            />

            {/* Connecting Line */}
            {step < steps && (
              <div
                className="w-[9vh] h-[0.4vh]"
                style={{
                  backgroundColor: normalColor,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepProgress;