import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';

import TextField from '../components/ui/TextField';
import ErrorBanner from '../components/ui/ErrorBanner';
import { DEMO_EMAIL, validateLogin } from '../lib/demoAuth';

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const recoveryHint = useMemo(
    () =>
      'For this demo environment, password reset emails are simulated and routed to the configured account.' ,
    [],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validationError = validateLogin(email, 'Aris#123');

    if (validationError && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address so we can send reset instructions.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-black/40 p-8">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline transition-transform duration-200 hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium">Enterprise account recovery</span>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          We will send instructions to help you regain access to your account securely.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Work email
              </label>
              <TextField
                icon={Mail}
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <ErrorBanner message={error} />

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              Send reset link
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/70 dark:bg-emerald-950/40">
            <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Reset link sent</span>
            </div>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
              We have simulated a secure password reset request for <span className="font-semibold">{email}</span>.
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{recoveryHint}</p>
            <button
              type="button"
              onClick={onBackToLogin}
              className="mt-5 w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-sm dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800"
            >
              Return to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
