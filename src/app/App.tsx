import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { AuthContext, EMPTY_USER } from "@/app/authContext";
import { router } from "@/app/routes";
import type { UserAccount } from "@/data/demoAccounts";
import {
  signIn as authenticate,
  signOut as serverSignOut,
  verifySession,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
} from "@/services/authService";
import arisLogo from "@/assets/brand/image.png";

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(getStoredUser);
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(getStoredUser()));

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const session = await verifySession();
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    const handleSessionExpired = () => {
      setUser(null);
      void router.navigate("/login");
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "aris-user" || e.key === "aris-token") {
        const current = getStoredUser();
        setUser(current);
        if (!current) {
          void router.navigate("/login");
        }
      }
    };

    window.addEventListener("aris:session-expired", handleSessionExpired);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener("aris:session-expired", handleSessionExpired);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const session = await authenticate(email, password);
    if (!["administrator", "admin", "staff"].includes(session.user.role)) {
      throw new Error("This account role cannot access ARIS Web.");
    }
    setStoredSession(session.user, session.token);
    setUser(session.user);
    await router.navigate("/");
  };

  const signOut = async () => {
    try {
      await serverSignOut();
    } finally {
      clearStoredSession();
      setUser(null);
      void router.navigate("/login");
    }
  };

  const isAuthenticated = Boolean(user?.id && user?.email);

  if (isCheckingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8faf9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#e2e8e4] flex items-center justify-center p-2">
            <img src={arisLogo} alt="ARIS" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-2 text-[#5a6b5e] text-sm font-medium">
            <div className="w-4 h-4 border-2 border-[#3a7d4e] border-t-transparent rounded-full animate-spin" />
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        signOut,
        signIn,
        user: user ?? EMPTY_USER,
        isAuthenticated,
        isLoading: isCheckingSession,
      }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}
