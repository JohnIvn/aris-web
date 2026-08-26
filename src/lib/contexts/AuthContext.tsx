import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import {
  verifyuser,
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
} from "../../api/auth";
import { UserData, SignInData, SignUpData } from "../data/auth.interface";
import { setAccessToken } from "../token";

interface AuthState {
  user: UserData | null;
  token: string;
  initialized: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  initialize: () => Promise<void>;
  login: (
    credentials: SignInData,
  ) => Promise<{ ok: boolean; error?: string[] }>;
  signup: (payload: SignUpData) => Promise<{ ok: boolean; error?: string[] }>;
  logout: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: "",
  initialized: false,
  loading: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applyAuthResult(
  setState: React.Dispatch<React.SetStateAction<AuthState>>,
  data: { user: UserData; token: string },
) {
  setAccessToken(data.token);
  setState({
    user: data.user,
    token: data.token,
    initialized: true,
    loading: false,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const initialize = useCallback(async () => {
    const response = await verifyuser();

    if (!response.ok) {
      setAccessToken("");
      setState({ ...initialState, initialized: true });
      return;
    }

    applyAuthResult(
      setState,
      response.data as { user: UserData; token: string },
    );
  }, []);

  const login = useCallback(async (credentials: SignInData) => {
    setState((s) => ({ ...s, loading: true }));
    const response = await apiSignIn(credentials);

    if (!response.ok) {
      setState((s) => ({ ...s, loading: false }));
      return { ok: false, error: response.error as string[] };
    }

    applyAuthResult(
      setState,
      response.data as { user: UserData; token: string },
    );
    return { ok: true };
  }, []);

  const signup = useCallback(async (payload: SignUpData) => {
    setState((s) => ({ ...s, loading: true }));
    const response = await apiSignUp(payload);

    if (!response.ok) {
      setState((s) => ({ ...s, loading: false }));
      return { ok: false, error: response.error as string[] };
    }

    applyAuthResult(
      setState,
      response.data as { user: UserData; token: string },
    );
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await apiSignOut();
    setAccessToken("");
    setState({ ...initialState, initialized: true });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, initialize, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
