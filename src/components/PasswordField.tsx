import { useState } from "react";

export const isPasswordValid = (value: string) =>
  value.length >= 8 &&
  value.length <= 15 &&
  /[A-Z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

export default function PasswordField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const hasValue = value.length > 0;
  const valid = isPasswordValid(value);

  return (
    <div>
      <div className="relative">
        <input
          aria-label="Password"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={15}
          autoComplete="new-password"
          className="w-full h-10 px-3.5 pr-11 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]"
          style={{ borderColor: hasValue && !valid ? "#f1a5a5" : "#e2e8e4" }}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#8fa394] hover:text-[#3a7d4e]"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <p className={`mt-1 text-[11px] ${hasValue && !valid ? "text-red-600" : "text-[#8fa394]"}`}>
        8-15 characters with a capital letter, a number, and a symbol.
      </p>
    </div>
  );
}
