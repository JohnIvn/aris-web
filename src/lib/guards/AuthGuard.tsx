// guards/AuthGuard.tsx
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Spinner } from "../../components/Spinner";
import { useAuth } from "../contexts/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, initialized, initialize } = useAuth();

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialized, initialize]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
