import { createContext, useContext } from "react";
import type { UserAccount } from "@/data/demoAccounts";

export const EMPTY_USER: UserAccount = {
  id: "",
  email: "",
  name: "",
  role: "administrator",
};

export interface AuthContextType {
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  user: UserAccount;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  signOut: () => {},
  signIn: async () => {},
  user: EMPTY_USER,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);
