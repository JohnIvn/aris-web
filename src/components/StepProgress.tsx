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

        // Step is completed/current
        const isCompleted = step <= currentStep;

        // The line after this step should be green
        // if the NEXT step has already been reached.
        const isLineCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            {/* Step Circle */}
            <div
              className="w-[1.5vh] h-[1.5vh] rounded-full"
              style={{
                backgroundColor: isCompleted
                  ? highlightColor
                  : normalColor,
              }}
            />

            {/* Connecting Line */}
            {step < steps && (
              <div
                className="w-[9vh] h-[0.4vh]"
                style={{
                  backgroundColor: isLineCompleted
                    ? highlightColor
                    : normalColor,
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