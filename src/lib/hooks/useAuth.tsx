import { useEffect, useState } from "react";
import { Spinner } from "../../components/Spinner";
import { Navigate } from "react-router-dom";
import { verifyuser } from "../../api/auth";
import { UserData } from "../data/auth.interface";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const response = await verifyuser();

      if (!response.ok) {
        setToken("");
        setInitialized(true);
      }

      const data = response.data as {
        user: UserData;
        token: string;
      };
      setToken(data.token);
      setInitialized(true);
    };

    initialize();
  });

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
