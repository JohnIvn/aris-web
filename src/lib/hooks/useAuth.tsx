import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized, serverDown } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  if (serverDown) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
