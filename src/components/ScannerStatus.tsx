import React from "react";
import Spacer from "./Spacer";

interface ScannerStatusProps {
  title?: string;
  message?: string;
  status?: "waiting" | "scanning" | "success" | "error";
}

const ScannerStatus: React.FC<ScannerStatusProps> = ({
  title = "Waiting for report...",
  message = "Please place the report on the scanner.",
  status = "waiting",
}) => {
  const statusStyles = {
    waiting: {
      border: "#D4A017",
      icon: "text-[#D4A017]",
    },
    scanning: {
      border: "#D4A017",
      icon: "text-[#D4A017]",
    },
    success: {
      border: "#4FAE4A",
      icon: "text-[#4FAE4A]",
    },
    error: {
      border: "#C94A4A",
      icon: "text-[#C94A4A]",
    },
  };

  const style = statusStyles[status];

  return (
    <div
      className="flex items-center justify-center gap-3 rounded-2xl px-5 py-3"
      style={{
        border: `1px solid ${style.border}`,
      }}
    >
      {status === "waiting" || status === "scanning" ? (
        <div
          className={`h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-current ${style.icon}`}
        />
      ) : (
        <div className={`text-xl ${style.icon}`}>
          {status === "success" ? "✓" : "!"}
        </div>
      )}

      <div className="flex flex-col">
        <p 
            className="leading-none text-[2.2833vh] font-medium"
            style={{ color: style.border}}
        >
          {title}
        </p>

        <Spacer size={2} />

        <p className="leading-none text-[2.0229vh] font-normal text-[#7A7F89]">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ScannerStatus;