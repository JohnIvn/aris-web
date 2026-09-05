import React, { useState } from 'react';
import { GraduationCap, Users, Mail } from 'lucide-react';

import BrandPanel from "../components/BrandPanel";
import TabToggle, { TabOption } from "../components/ui/TabToggle";
import GoogleButton from "../components/ui/GoogleButton";
import TextField from "../components/ui/TextField";
import PasswordField from "../components/ui/PasswordField";
import ErrorBanner from "../components/ui/ErrorBanner";
import ThemeToggle from "../components/ui/ThemeToggle";
import Spacer from "../components/ui/Spacer";
import { useTheme } from "../components/context/ThemeContext";
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/demoAuth';

export interface LoginProps {
    email?: string;
    password?: string;
    remember?: boolean;
    textColor?: string;
    accentColor?: string;
    secondAccentColor?: string;
    accentActive?: string;
    accentHover?: string;
    error?: string | null;
    onLogin?: (email: string, password: string, remember: boolean, role: Role) => void;
    onGoogleLogin?: () => void;
    onForgotPassword?: () => void;
}

export type Role = 'professor' | 'staff';

const roleOptions: [TabOption<Role>, TabOption<Role>] = [
    { value: 'professor', label: 'Professor', badge: 'Google Account', icon: GraduationCap },
    { value: 'staff', label: 'Staff', badge: 'Email & Password', icon: Users },
];

const LoginForm: React.FC<LoginProps> = ({
    onLogin,
    onGoogleLogin,
    onForgotPassword,
    error,
    // textColor = "#1e293b",      // Tailwind slate-800
    accentColor = "#047857",    // Tailwind emerald-700
    accentHover = "#065f46",    // Tailwind emerald-800
    accentActive = "#064e3b",   // Tailwind emerald-900
    secondAccentColor = "#64748b", // Tailwind slate-500
}) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const [role, setRole] = useState<Role>('professor');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [btnState, setBtnState] = useState<'idle' | 'hover' | 'active'>('idle');

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        onLogin?.(email, password, remember, role);
    };

    const demoBadgeText = role === 'staff'
        ? 'Demo staff account: checker@aris.edu.ph / Checker123'
        : `Demo professor account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`;

    // In light mode, props drive the inline color directly. In dark mode we
    // leave style undefined and let the dark: Tailwind classes take over,
    // since the hex props are only meant for the light theme.
    
    const accentStyle = isLight ? { color: accentColor } : undefined;
    // const textStyle = isLight ? { color: textColor } : undefined;
    const secondaryStyle = isLight ? { color: secondAccentColor } : undefined;

    const btnBg = isLight
        ? btnState === 'active'
            ? accentActive
            : btnState === 'hover'
                ? accentHover
                : accentColor
        : undefined;

    return (
        <div className="min-h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950 p-3 sm:p-4 transition-colors">
            <div className="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900 dark:shadow-black/40 md:max-h-[760px] md:flex-row">
                <div className="absolute right-4 top-4 z-20 hidden sm:block">
                    <ThemeToggle />
                </div>

                <BrandPanel />

                {/* Right panel */}
                <div className="w-full p-4 sm:p-6 md:w-[54%] md:p-8">
                    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
                        <h2 style={accentStyle} className="text-3xl font-bold dark:text-emerald-400">
                            Welcome Back!
                        </h2>
                        <p style={secondaryStyle} className="dark:text-slate-400">
                            Sign in to access your account.
                        </p>

                        <Spacer size={24} />

                        <TabToggle options={roleOptions} value={role} onChange={setRole} />

                        <Spacer size={24} />

                        {role === 'professor' && (
                            <div>
                                <Spacer size={30} />

                                <p style={accentStyle} className="font-semibold  text-sm text-center dark:text-emerald-400">
                                    For Professors
                                </p>
                                <Spacer size={4} />
                                <p style={secondaryStyle} className="text-sm text-center dark:text-slate-400">
                                    Continue using your Google account to access the system.
                                </p>
                                <Spacer size={16} />
                                <GoogleButton onClick={onGoogleLogin} />
                            </div>
                        )}

                        {role === 'staff' && (
                            <>
                                <Spacer size={4} />
                                <p style={secondaryStyle} className="text-sm text-center dark:text-slate-400">
                                    Use your registered email and password.
                                </p>
                                <Spacer size={16} />

                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[11px] font-medium text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        {demoBadgeText}
                                    </div>

                                    <TextField
                                        icon={Mail}
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />

                                    <PasswordField
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />

                                    <div className="flex items-center justify-between text-sm pt-1">
                                        <label style={secondaryStyle} className="flex items-center gap-2 dark:text-slate-300 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={remember}
                                                onChange={(e) => setRemember(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                                                style={isLight ? { accentColor } : undefined}
                                            />
                                            Remember me
                                        </label>
                                        <button
                                            type="button"
                                            onClick={onForgotPassword}
                                            style={accentStyle}
                                            className="font-medium hover:underline dark:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <ErrorBanner message={error} />

                                    <button
                                        type="submit"
                                        style={{ backgroundColor: btnBg }}
                                        onMouseEnter={() => setBtnState('hover')}
                                        onMouseLeave={() => setBtnState('idle')}
                                        onMouseDown={() => setBtnState('active')}
                                        onMouseUp={() => setBtnState('hover')}
                                        className="w-full dark:bg-emerald-600 
                                            dark:hover:bg-emerald-500 text-white 
                                            font-semibold py-3 rounded-xl transition-all 
                                            duration-200 shadow-sm hover:-translate-y-0.5 
                                            hover:shadow-md focus:outline-none focus-visible:ring-2 
                                            focus-visible:ring-emerald-500 focus-visible:ring-offset-2 
                                            dark:focus-visible:ring-offset-slate-900"
                                    >
                                        Sign In
                                    </button>
                                </form>
                            </>
                        )}

                        <p
                            style={secondaryStyle}
                            className="text-center text-sm dark:text-slate-400 mt-auto pt-8"
                        >
                            Need help?{' '}
                            <a
                                href="#"
                                style={accentStyle}
                                className="font-medium hover:underline dark:text-emerald-400"
                            >
                                Contact your system administrator.
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Login: React.FC<LoginProps> = (props) => (
    <LoginForm {...props} />
);

export default Login;