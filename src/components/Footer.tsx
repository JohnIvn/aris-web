import React from 'react';
import { ShieldCheck } from 'lucide-react';

const currentYear = new Date().getFullYear();

const Footer: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
      <span className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
        Secure. Reliable. Built for Excellence.
      </span>
      <span>&copy; {currentYear} A.R.I.S. All rights reserved.</span>
    </div>
  );
};

export default Footer;