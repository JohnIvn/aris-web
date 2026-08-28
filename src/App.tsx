import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import { useAuthStore } from "./lib/stores/auth.store";

// Layout
import AppLayoutRoute from "./layouts/AppLayoutRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import MeetingAttendance from "./pages/MeetingAttendance";
import { ThemeProvider } from "./components/context/ThemeContext";


const LoginRoute = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const signIn = useAuthStore((s) => s.signIn);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      await signIn({ email, password });
      navigate("/user/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    }
  };

  return <Login onLogin={handleLogin} error={error} />;
};

// Profile Route
const ProfileRoute = () => {
  return <Profile />;
}

// Meeting Attendance Route
const MeetingAttendanceRoute = () => {
  return <MeetingAttendance />;
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginRoute />} />
          <Route path="/user" element={<AppLayoutRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="meetings" element={<MeetingAttendanceRoute />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;