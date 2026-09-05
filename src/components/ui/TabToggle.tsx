import { LucideIcon, CheckCircle2 } from 'lucide-react';

export interface TabOption<T extends string> {
  value: T;
  label: string;
  badge: string;
  icon: LucideIcon;
}

export interface TabToggleProps<T extends string> {
  options: [TabOption<T>, TabOption<T>];
  value: T;
  onChange: (value: T) => void;
}

/**
 * The active tab is marked with a checkmark badge and a thicker (2px) ring
 * in addition to the color change, so the selected state doesn't depend on
 * color perception alone.
 */
function TabToggle<T extends string>({ options, value, onChange }: TabToggleProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup">
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative cursor-pointer rounded-xl border text-left p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              active
                ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {active && (
              <CheckCircle2
                className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute top-2.5 right-2.5"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100 pr-5">
              <Icon
                className={`w-5 h-5 ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
              />
              {option.label}
            </div>
            <span
              className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                active
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
              }`}
            >
              {option.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default TabToggle;