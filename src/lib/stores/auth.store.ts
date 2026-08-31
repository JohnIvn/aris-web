import { create } from "zustand";
import { SignInData, SignUpData, UserSession } from "../data/auth.interface";
import { DEMO_ACCOUNTS } from "../demoAuth";
import { httpRequest, registerAccessTokenGetter } from "../utils/api";
import {
  clearPersistedRefreshToken,
  clearSessionCookie,
  getPersistedRefreshToken,
  getSessionCookie,
  persistRefreshToken,
  setSessionCookie,
} from "../utils/auth.helpers";
import { useUIStore } from "./ui.store";

const LAST_USER_KEY = "auth:last-user";

interface AuthState {
  loading: boolean;
  user: UserSession | null;
  token: string | null;
  initialized: boolean;
  serverDown: boolean;
  initialize: () => Promise<{ down: boolean }>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
}

const authStateInit = {
  loading: false,
  user: null,
  token: null,
  initialized: false,
  serverDown: false,
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...authStateInit,
  initialize: async () => {
    set({ loading: true });

    const lastUser = localStorage.getItem(LAST_USER_KEY);
    const cachedSession = getSessionCookie();

    if (!lastUser && !cachedSession) {
      set({ loading: false, initialized: true });
      return { down: false };
    }

    try {
      const refreshToken = lastUser ? getPersistedRefreshToken(lastUser) : null;

      if (!refreshToken && !cachedSession) {
        set({ loading: false, initialized: true });
        return { down: false };
      }

      if (lastUser && refreshToken) {
        const response = await httpRequest("/auth/refresh", {
          method: "POST",
          data: { refreshToken },
        });

        if (response.serverDown) {
          const cachedRole = cachedSession?.role ?? DEMO_ACCOUNTS.find((account) => account.email.toLowerCase() === lastUser.toLowerCase())?.role;
          if (cachedRole) {
            const fallbackUser = DEMO_ACCOUNTS.find((account) => account.email.toLowerCase() === lastUser.toLowerCase());
            if (fallbackUser) {
              set({
                user: {
                  id: fallbackUser.id,
                  email: fallbackUser.email,
                  role: fallbackUser.role,
                  name: fallbackUser.name,
                  fullName: fallbackUser.fullName,
                  position: fallbackUser.position,
                  department: fallbackUser.department,
                  photoUrl: fallbackUser.photoUrl,
                },
                token: "demo-access-token",
                loading: false,
                initialized: true,
                serverDown: true,
              });
              return { down: true };
            }
          }

          set({ loading: false, initialized: true, serverDown: true });
          return { down: true };
        }

        if (response.error) throw new Error(response.error);

        const responseData = response.data as {
          user: UserSession;
          token: string;
          refreshToken: string;
        };

        await persistRefreshToken(
          LAST_USER_KEY,
          lastUser,
          responseData.refreshToken,
        );

        setSessionCookie({
          email: responseData.user.email,
          role: responseData.user.role,
        });

        set({
          user: responseData.user,
          token: responseData.token,
          loading: false,
          initialized: true,
          serverDown: false,
        });

        return { down: false };
      }

      if (cachedSession) {
        const matchedDemoAccount = DEMO_ACCOUNTS.find(
          (account) => account.email.trim().toLowerCase() === cachedSession.email.trim().toLowerCase(),
        );

        if (!matchedDemoAccount) {
          clearSessionCookie();
          set({ loading: false, initialized: true });
          return { down: false };
        }

        const mappedUser: UserSession = {
          id: matchedDemoAccount.id,
          email: matchedDemoAccount.email,
          role: matchedDemoAccount.role,
          name: matchedDemoAccount.name,
          fullName: matchedDemoAccount.fullName,
          position: matchedDemoAccount.position,
          department: matchedDemoAccount.department,
          photoUrl: matchedDemoAccount.photoUrl,
        };

        set({
          user: mappedUser,
          token: "demo-access-token",
          loading: false,
          initialized: true,
          serverDown: false,
        });

        return { down: false };
      }

      set({ loading: false, initialized: true });
      return { down: false };
    } catch (error) {
      console.error("Error initializing session:", error);
      if (lastUser) {
        await clearPersistedRefreshToken(LAST_USER_KEY, lastUser);
      }
      clearSessionCookie();
      set({ loading: false, initialized: true });
      return { down: false };
    }
  },

  signIn: async (data) => {
    set({ loading: true });
    try {
      const normalizedEmail = data.email.trim().toLowerCase();
      const demoMode = import.meta.env.VITE_DEMO_AUTH_ENABLED !== "false";
      const matchedDemoAccount = DEMO_ACCOUNTS.find(
        (account) => account.email.trim().toLowerCase() === normalizedEmail,
      );

      if (demoMode) {
        if (matchedDemoAccount && matchedDemoAccount.password !== data.password) {
          throw new Error(
            `Incorrect password for ${matchedDemoAccount.email}. Use the demo password shown in the form.`,
          );
        }

        if (!matchedDemoAccount) {
          throw new Error(
            "Demo account not found. Use one of the sample ARIS accounts shown on the login screen.",
          );
        }

        await persistRefreshToken(LAST_USER_KEY, matchedDemoAccount.email, "demo-refresh-token");
        setSessionCookie({ email: matchedDemoAccount.email, role: matchedDemoAccount.role });

        const mappedUser: UserSession = {
          id: matchedDemoAccount.id,
          email: matchedDemoAccount.email,
          role: matchedDemoAccount.role,
          name: matchedDemoAccount.name,
          fullName: matchedDemoAccount.fullName,
          position: matchedDemoAccount.position,
          department: matchedDemoAccount.department,
          photoUrl: matchedDemoAccount.photoUrl,
        };

        set({
          user: mappedUser,
          token: "demo-access-token",
          loading: false,
          initialized: true,
        });

        useUIStore.getState().addToast({
          type: "success",
          message: "Demo sign in successful",
          description: `Welcome back, ${matchedDemoAccount.fullName}.`,
        });
        return;
      }

      const response = await httpRequest("/auth/signin", {
        method: "POST",
        data,
      });

      if (response.error) throw new Error(response.error);

      const responseData = response.data as {
        user: UserSession;
        token: string;
        refreshToken: string;
      };

      await persistRefreshToken(
        LAST_USER_KEY,
        responseData.user.email,
        responseData.refreshToken,
      );
      setSessionCookie({ email: responseData.user.email, role: responseData.user.role });

      set({
        user: responseData.user,
        token: responseData.token,
        loading: false,
      });
      useUIStore.getState().addToast({
        type: "success",
        message: "Signed In Successfully",
        description: `Successfully Signed In as ${get().user?.email}`,
      });
      return;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error signing in";
      console.error(message);
      set({ loading: false });
      useUIStore.getState().addToast({
        type: "error",
        message: "Unable to sign in",
        description: message,
      });
      if (error instanceof Error) {
        throw error;
      }
      throw error;
    }
  },

  signOut: async () => {
    const currentUser = get().user;
    set({ loading: true });
    try {
      await httpRequest("/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Error signing out on server:", error);
    } finally {
      await clearPersistedRefreshToken(
        LAST_USER_KEY,
        currentUser?.email ?? null,
      );
      clearSessionCookie();
      set({ ...authStateInit, initialized: true });
    }
  },

  signUp: async (data) => {
    set({ loading: true });
    try {
      const response = await httpRequest("/auth/signup", {
        method: "POST",
        data,
      });

      if (response.error) throw new Error(response.error);

      await get().signIn({ email: data.email, password: data.password });
      return;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error signing in";
      console.error(message);
      set({ loading: false });

      useUIStore.getState().addToast({
        type: "success",
        message: "Signed In Successfully",
        description: `Successfully Signed In as ${get().user?.email}`,
      });
      return;
    }
  },
}));

registerAccessTokenGetter(() => useAuthStore.getState().token);
