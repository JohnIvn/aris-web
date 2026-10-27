import { useState } from "react";
import { RouterProvider } from "react-router";
import { AuthContext, EMPTY_USER } from "@/app/authContext";
import { router } from "@/app/routes";
import type { UserAccount } from "@/data/demoAccounts";
import { signIn as authenticate } from "@/services/authService";

function getStoredUser(): UserAccount | null {
  try {
    const user = JSON.parse(sessionStorage.getItem("aris-user") ?? "null") as UserAccount | null;
    return user?.id && user?.email && ["administrator", "admin", "staff"].includes(user.role) ? user : null;
  } catch {
    sessionStorage.removeItem("aris-user");
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(getStoredUser);

  const signIn = async (email: string, password: string) => {
    const session = await authenticate(email, password);
    if (!["administrator", "admin", "staff"].includes(session.user.role)) {
      throw new Error("This account role cannot access ARIS Web.");
    }
    sessionStorage.setItem("aris-user", JSON.stringify(session.user));
    if (session.token) sessionStorage.setItem("aris-token", session.token);
    setUser(session.user);
    await router.navigate("/");
  };

  const signOut = () => {
    sessionStorage.removeItem("aris-user");
    sessionStorage.removeItem("aris-token");
    setUser(null);
    router.navigate("/");
  };

  const isAuthenticated = Boolean(user?.id && user?.email);

  return (
    <AuthContext.Provider
      value={{
        signOut,
        signIn,
        user: user ?? EMPTY_USER,
        isAuthenticated,
      }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}
