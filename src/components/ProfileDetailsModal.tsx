import { useEffect, useRef } from "react";

type ProfileField = {
  label: string;
  value: string;
  wide?: boolean;
};

export default function ProfileDetailsModal({
  isOpen,
  onClose,
  heading,
  name,
  role,
  fields,
}: {
  isOpen: boolean;
  onClose: () => void;
  heading: string;
  name: string;
  role: string;
  fields: ProfileField[];
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const main = overlayRef.current?.closest("main");
    if (!main) return;

    const previousOverflow = main.style.overflow;
    main.style.overflow = "hidden";
    return () => {
      main.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const nameParts = name
    .replace(/^(dr|prof)\.?\s+/i, "")
    .trim()
    .split(/\s+/);
  const firstName = nameParts[0] || "Not provided";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Not provided";
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "Not provided";

  const profileFields: ProfileField[] = [
    { label: "First name", value: firstName },
    { label: "Last name", value: lastName },
    { label: "Middle name", value: middleName },
    ...fields,
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-[620px] overflow-y-auto overscroll-contain rounded-[24px] bg-white p-6 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold uppercase tracking-wide text-[#111c14]">{heading}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile details"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#718076] hover:bg-[#f4f6f5]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="mb-5">
          <p className="mb-1 text-[11px] font-medium uppercase text-[#536258]">Name</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[20px] font-semibold leading-tight text-[#17251c]">{name.replace(/^(dr|prof)\.?\s+/i, "")}</p>
            <span className="rounded-full bg-[#fbf1de] px-2.5 py-1.5 text-[10px] font-medium uppercase text-[#996515]">{role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {profileFields.map((field) => (
            <label key={field.label} className={field.wide ? "sm:col-span-2" : ""}>
              <span className="mb-1.5 block pl-0.5 text-[12px] font-medium text-[#536258]">{field.label}</span>
              <input
                readOnly
                aria-label={field.label}
                value={field.value || "Not provided"}
                className="h-11 w-full rounded-xl border border-[#e2e8e4] bg-white px-3 text-[13px] text-[#17251c] outline-none"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
