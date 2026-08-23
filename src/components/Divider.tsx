import React from "react";

interface DividerProps {
  color?: string;
  starColor?: string;
  lineWidth?: string;
  lineHeight?: string;
  gap?: string;
}

const Divider: React.FC<DividerProps> = ({
  color = "#47BA56",
  starColor = "#F5C542",
  lineWidth = "8vh",
  lineHeight = "0.2vh",
  gap = "1vh",
}) => {
  return (
    <div className="flex items-center justify-center">
      <div
        style={{
          width: lineWidth,
          height: lineHeight,
          backgroundColor: color,
        }}
      />

      <span
        className="leading-none"
        style={{
          color: starColor,
          margin: `0 ${gap}`,
          fontSize: "2vh",
        }}
      >
        ★
      </span>

      <div
        style={{
          width: lineWidth,
          height: lineHeight,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

export default Divider;