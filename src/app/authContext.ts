import { createContext, useContext } from "react";
import type { UserAccount } from "@/data/demoAccounts";

export const AuthContext = createContext<{ signOut: () => void; user: UserAccount }>({
  signOut: () => {},
  user: { id: "", email: "", name: "", role: "administrator" },
});

export const useAuth = () => useContext(AuthContext);