import "./App.css";
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { AuthGuard } from "./lib/hooks/useAuth";
import { useAuthStore } from "./lib/stores/auth.store";
import ServerMaintenancePage from "./pages/ServerDown";

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <main className="flex h-screen overflow-hidden bg-background text-on-background font-body antialiased">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route element={<h1>Landing Page</h1>} path="/" />
          <Route element={<h1>Sign In</h1>} path="/signin" />
          <Route element={<h1>Sign Up</h1>} path="/signup" />
          <Route
            element={<ServerMaintenancePage />}
            path="/server-maintenance"
          />

          {/* Protected routes */}
          <Route
            element={
              <AuthGuard>
                <Outlet />
              </AuthGuard>
            }
          >
            <Route element={<h1>Dashboard</h1>} path="/dashboard" />
            <Route element={<h1>Tasks</h1>} path="/tasks" />
            <Route element={<h1>Settings</h1>} path="/settings" />
          </Route>
        </Routes>
      </Router>
    </main>
  );
}

export default App;
