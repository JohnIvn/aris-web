import React from "react";

interface ButtonProps {
  children?: React.ReactNode;
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  fontSize?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children = "Continue",
  width = "30vh",
  height = "5vh",
  backgroundColor = "#45BA55",
  textColor = "#FFFFFF",
  borderRadius = "999px",
  fontSize = "2vh",
  disabled = false,
  loading = false,
  className,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center font-bold transition-all duration-200 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{
        width,
        height,
        backgroundColor,
        color: textColor,
        borderRadius,
        fontSize,
      }}
    >
      {loading ? "Loading..." : children}

      {!loading && children === "Continue" && (
        <span className="ml-[1vh]">›</span>
      )}
    </button>
  );
};

export default Button;