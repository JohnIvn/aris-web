import React from 'react';
import { GraduationCap, CheckCircle2, BarChart3 } from 'lucide-react';

export interface BrandPanelProps {
  logoInitials?: string;
  title?: string;
  subtitle?: React.ReactNode;
  taglines?: string[];
}

const BrandPanel: React.FC<BrandPanelProps> = ({
  title = 'A . R . I . S',
  subtitle = (
    <>
      Accomplishment Report
      <br />
      Information System
    </>
  ),
  taglines = ['Streamlined reporting.', 'Transparent approvals.', 'Stronger performance.'],
}) => {
  return (
    <div className="relative md:w-[46%] h-full min-h-[280px] text-white overflow-hidden bg-emerald-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 40px)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center ring-2 ring-yellow-100/70 shrink-0">
              <GraduationCap className="w-7 h-7 text-emerald-950" strokeWidth={2.4} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest leading-none">{title}</h1>
          </div>
          <p className="text-lg md:text-xl font-medium leading-snug">{subtitle}</p>

          <div className="w-14 h-0.5 bg-emerald-400/70 my-6 rounded-full" />

          <ul className="space-y-1.5 text-sm md:text-base text-emerald-50/90 font-medium">
            {taglines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        {/* Illustration */}
        <div className="hidden md:flex items-end gap-3 mt-10 select-none">
          <div className="flex flex-col items-center mb-1">
            <div className="flex gap-1 mb-1">
              <div className="w-6 h-10 bg-emerald-400 rounded-tl-full rounded-br-full -rotate-12 origin-bottom" />
              <div className="w-6 h-12 bg-emerald-300 rounded-tr-full rounded-bl-full rotate-12 origin-bottom" />
            </div>
            <div className="w-10 h-8 bg-white/90 rounded-b-md rounded-t-sm" />
          </div>

          <div className="relative w-32 h-44 bg-white rounded-md shadow-lg border-4 border-emerald-600 flex flex-col p-3 gap-2">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-4 bg-emerald-600 rounded-sm" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5 mt-2 first:mt-2 [&:not(:first-child)]:mt-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div className="h-1.5 bg-slate-200 rounded-full flex-1" />
              </div>
            ))}
            <div className="flex items-end gap-1 h-12 mt-auto">
              <BarChart3 className="w-full h-full text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>

          <div className="mb-1">
            <div className="w-16 h-11 bg-emerald-100 rounded-sm shadow-md border-2 border-emerald-700 relative">
              <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-px bg-emerald-700/40" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-700/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPanel;