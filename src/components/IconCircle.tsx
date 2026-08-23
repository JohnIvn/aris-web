import React from "react";

interface IconCircleProps {
  children: React.ReactNode;
  size?: string;
  shadow?: boolean;
  border?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
}

const IconCircle: React.FC<IconCircleProps> = ({
  children,
  size = "10vh",
  shadow = false,
  border = false,
  borderColor = "#D9D9D9",
  backgroundColor = "#F8F7F7",
  shadowColor = "#4FAE4A",
  shadowOffsetX = 0,
  shadowOffsetY = 4,
  shadowBlur = 53,
  shadowSpread = -8,
}) => {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor,
        border: border ? `0.2vh solid ${borderColor}` : "none",
        boxShadow: shadow
          ? `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`
          : "none",
      }}
    >
      {children}
    </div>
  );
};

export default IconCircle;