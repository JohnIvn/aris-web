import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ErrorBannerProps {
  message?: string | null;
}

/**
 * Uses an icon + border + bold weight in addition to red, so the error
 * doesn't rely on color perception alone (color-blind safe).
 */
const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="flex items-start gap-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg px-3 py-2"
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
};

export default ErrorBanner;