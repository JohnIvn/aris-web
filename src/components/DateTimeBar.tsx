import React, { useEffect, useState } from "react";

interface DateTimeBarProps {
  size?: string;
  color?: string;
}

const DateTimeBar: React.FC<DateTimeBarProps> = ({
  size = "2.0833vh",
  color = "#989898",
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const date = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="absolute bottom-[3.0833vh] left-0 right-0 flex items-center justify-between px-[3.125vh]">
      {/* Date */}
      <p
        className="leading-none"
        style={{
          fontSize: size,
          color: color,
        }}
      >
        {date}
      </p>

      {/* Time */}
      <p
        className="leading-none"
        style={{
          fontSize: size,
          color: color,
        }}
      >
        {time}
      </p>
    </div>
  );
};

export default DateTimeBar;