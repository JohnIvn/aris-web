import { useState } from "react";
import { RouterProvider } from "react-router";
import Login from "@/components/Login";
import { AuthContext, router } from "@/app/routes";

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("aris-authed") === "1");

  const signIn = () => {
    sessionStorage.setItem("aris-authed", "1");
    setAuthed(true);
  };
  const signOut = () => {
    sessionStorage.removeItem("aris-authed");
    setAuthed(false);
  };

  if (!authed) return <Login onSignIn={signIn} />;

  return (
    <AuthContext.Provider value={{ signOut }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}
