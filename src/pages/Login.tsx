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
    onLogin?: (email: string, password: string, remember: boolean) => void;
}

type Role = 'professor' | 'staff';

const roleOptions: [TabOption<Role>, TabOption<Role>] = [
    { value: 'professor', label: 'Professor', badge: 'Google Account', icon: GraduationCap },
    { value: 'staff', label: 'Staff / Admin', badge: 'Email & Password', icon: Users },
];

const LoginForm: React.FC<LoginProps> = ({
    onLogin,
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
        onLogin?.(email, password, remember);
    };

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
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors">
            <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-black/40 overflow-hidden flex flex-col md:flex-row relative">
                <div className="absolute top-4 right-4 z-20">
                    <ThemeToggle />
                </div>

                <BrandPanel />

                {/* Right panel */}
                <div className="md:w-[54%] p-8 flex flex-col">
                    <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
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

                                <p style={accentStyle} className="font-semibold text-sm text-center dark:text-emerald-400">
                                    For Professors
                                </p>
                                <Spacer size={4} />
                                <p style={secondaryStyle} className="text-sm text-center dark:text-slate-400">
                                    Continue using your Google account to access the system.
                                </p>
                                <Spacer size={16} />
                                <GoogleButton />
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
                                    <TextField
                                        icon={Mail}
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />

                                    <PasswordField
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                        <a
                                            href="#"
                                            style={accentStyle}
                                            className="font-medium hover:underline dark:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>

                                    <ErrorBanner message={error} />

                                    <button
                                        type="submit"
                                        style={{ backgroundColor: btnBg }}
                                        onMouseEnter={() => setBtnState('hover')}
                                        onMouseLeave={() => setBtnState('idle')}
                                        onMouseDown={() => setBtnState('active')}
                                        onMouseUp={() => setBtnState('hover')}
                                        className="w-full dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
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