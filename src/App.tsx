import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Bell, FileText, Home, ShieldCheck } from "lucide-react";

import { useAuthStore } from "./lib/stores/auth.store";
import { DEMO_EMAIL, DEMO_PASSWORD, validateLogin, buildGoogleAuthUrl } from "./lib/demoAuth";
import { getDashboardRouteForUser, getSessionCookie } from "./lib/utils/auth.helpers";

// Layout
import AppLayoutRoute from "./layouts/AppLayoutRoute";

// Pages
import Dashboard from "./pages/Professor/Dashboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Professor/Profile";
import MeetingAttendance from "./pages/Professor/MeetingAttendance";
import MyDTR from "./pages/Professor/Dtr";
import AccomplishmentReports from "./pages/Professor/AccomplishmentReports";
import { ThemeProvider } from "./components/context/ThemeContext";

import StaffDashboard from "./pages/Staff/StaffDashboard";
import PendingReports from "./pages/Staff/PendingReports";
import ReportDetailsReview from "./pages/Staff/ReportDetailsReview";
import ApprovalHistory from "./pages/Staff/ApprovalHistory";
import AuditTrail from "./pages/Staff/AuditTrail";
import AppLayout from "./layouts/AppLayout";
import { SidebarUser } from "./components/Sidebar";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  const cachedSession = getSessionCookie();
  const sessionUser = user ?? cachedSession;

  if (sessionUser) {
    return <Navigate to={getDashboardRouteForUser(sessionUser)} replace />;
  }

  return <>{children}</>;
};

const StaffLayoutRoute = () => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.loading);
  const signOut = useAuthStore((s) => s.signOut);

  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const sidebarUser: SidebarUser = {
    name: user.name ?? user.fullName ?? user.email,
    role: user.position ?? user.role,
    department: user.department ?? "—",
    avatarUrl: user.avatarUrl ?? user.photoUrl,
  };

  const activeKey = location.pathname.includes("/staff/history")
    ? "history"
    : location.pathname.includes("/staff/audit")
      ? "audit"
      : location.pathname.includes("/staff/reports")
        ? "reports"
        : "dashboard";

  const handleNavigate = (key: string) => {
    const routeMap: Record<string, string> = {
      dashboard: "/staff",
      reports: "/staff/reports",
      history: "/staff/history",
      audit: "/staff/audit",
    };

    const target = routeMap[key] ?? "/staff";
    navigate(target, { replace: false });
  };

  const handleSignOut = () => {
    signOut?.();
    navigate("/", { replace: true });
  };

  return (
    <AppLayout
      user={sidebarUser}
      activeKey={activeKey}
      navItems={[
        { key: 'dashboard', label: 'Dashboard', icon: Home },
        { key: 'reports', label: 'Pending Reports', icon: FileText },
        { key: 'history', label: 'Approval History', icon: ShieldCheck },
        { key: 'audit', label: 'Audit Trail', icon: Bell },
      ]}
      notificationCount={5}
      onNavigate={handleNavigate}
      onSignOut={handleSignOut}
    />
  );
};

const LoginRoute = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const signIn = useAuthStore((s) => s.signIn);

  const handleLogin = async (email: string, password: string, _remember: boolean, role: "professor" | "staff") => {
    const validationError = validateLogin(email, password, role);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      await signIn({ email, password });
      navigate(role === "staff" ? "/staff" : "/user/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    }
  };

  const handleGoogleLogin = async () => {
    const googleUrl = buildGoogleAuthUrl();

    if (googleUrl) {
      window.location.href = googleUrl;
      return;
    }

    try {
      await signIn({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      navigate("/user/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in with Google.");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} onForgotPassword={handleForgotPassword} error={error} />;
};

const ForgotPasswordRoute = () => {
  const navigate = useNavigate();

  return <ForgotPassword onBackToLogin={() => navigate("/")} />;
};

const GoogleCallbackRoute = () => {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      navigate("/", { replace: true });
      return;
    }

    if (code || import.meta.env.VITE_DEMO_AUTH_ENABLED !== "false") {
      signIn({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
        .then(() => navigate("/user/dashboard", { replace: true }))
        .catch(() => navigate("/", { replace: true }));
      return;
    }

    navigate("/", { replace: true });
  }, [navigate, signIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
      Completing Google sign in...
    </div>
  );
};

// Profile Route
const ProfileRoute = () => {
  const navigate = useNavigate();

  return <Profile onNavigate={(key) => {
    const routeMap: Record<string, string> = {
      dashboard: "/user/dashboard",
      notifications: "/user/dashboard",
    };

    navigate(routeMap[key] ?? "/user/dashboard");
  }} />;
}

// Meeting Attendance Route
const MeetingAttendanceRoute = () => {
  const navigate = useNavigate();

  return <MeetingAttendance onNavigate={(key) => {
    const routeMap: Record<string, string> = {
      dashboard: "/user/dashboard",
      notifications: "/user/dashboard",
    };

    navigate(routeMap[key] ?? "/user/dashboard");
  }} />;
}

const DashboardRoute = () => {
  const navigate = useNavigate();

  return <Dashboard onNavigate={(key) => {
    const routeMap: Record<string, string> = {
      reports: "/user/reports",
      dtr: "/user/dtr",
      attendance: "/user/meetings",
      meetings: "/user/meetings",
      notifications: "/user/dashboard",
      dashboard: "/user/dashboard",
    };

    navigate(routeMap[key] ?? "/user/dashboard");
  }} />;
}

const ReportsRoute = () => {
  return <AccomplishmentReports />;
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><LoginRoute /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordRoute /></PublicRoute>} />
          <Route path="/auth/google/callback" element={<PublicRoute><GoogleCallbackRoute /></PublicRoute>} />

          <Route path="/staff" element={<ProtectedRoute><StaffLayoutRoute /></ProtectedRoute>}>
            <Route index element={<StaffDashboard />} />
            <Route path="reports" element={<PendingReports />} />
            <Route path="reports/:id" element={<ReportDetailsReview />} />
            <Route path="history" element={<ApprovalHistory />} />
            <Route path="audit" element={<AuditTrail />} />
          </Route>

          <Route path="/user" element={<ProtectedRoute><AppLayoutRoute /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardRoute />} />
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="dtr" element={<MyDTR />} />
            <Route path="meetings" element={<MeetingAttendanceRoute />} />
            <Route path="reports" element={<ReportsRoute />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;