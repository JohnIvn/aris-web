import { useState } from "react";
import { RouterProvider } from "react-router";
import Login from "@/components/Login";
import { AuthContext, router } from "@/app/routes";
import type { UserAccount } from "@/data/demoAccounts";
import { signIn as authenticate } from "@/services/authService";

function getStoredUser(): UserAccount | null {
  try {
    const user = JSON.parse(sessionStorage.getItem("aris-user") ?? "null") as UserAccount | null;
    return user?.id && user?.email && (user.role === "administrator" || user.role === "professor") ? user : null;
  } catch {
    sessionStorage.removeItem("aris-user");
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(getStoredUser);

  const signIn = async (email: string, password: string) => {
    const session = await authenticate(email, password);
    sessionStorage.setItem("aris-user", JSON.stringify(session.user));
    if (session.token) sessionStorage.setItem("aris-token", session.token);
    await router.navigate(session.user.role === "professor" ? "/prof" : "/");
    setUser(session.user);
  };
  const signOut = () => {
    sessionStorage.removeItem("aris-user");
    sessionStorage.removeItem("aris-token");
    setUser(null);
  };

  if (!user) return <Login onSignIn={signIn} />;

  return (
    <AuthContext.Provider value={{ signOut, user }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}
