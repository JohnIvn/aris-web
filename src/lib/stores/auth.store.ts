import { create } from "zustand";
import { SignInData, SignUpData, UserSession } from "../data/auth.interface";
import { httpRequest, registerAccessTokenGetter } from "../utils/api";
import {
  clearPersistedRefreshToken,
  getPersistedRefreshToken,
  persistRefreshToken,
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
    if (!lastUser) {
      set({ loading: false, initialized: true });
      return { down: false };
    }

    try {
      const refreshToken = getPersistedRefreshToken(lastUser);

      if (!refreshToken) {
        set({ loading: false, initialized: true });
        return { down: false };
      }

      const response = await httpRequest("/auth/refresh", {
        method: "POST",
        data: { refreshToken },
      });

      if (response.serverDown) {
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

      set({
        user: responseData.user,
        token: responseData.token,
        loading: false,
        initialized: true,
        serverDown: false,
      });

      return { down: false };
    } catch (error) {
      console.error("Error initializing session:", error);
      await clearPersistedRefreshToken(LAST_USER_KEY, lastUser);
      set({ loading: false, initialized: true });
      return { down: false };
    }
  },

  signIn: async (data) => {
    set({ loading: true });
    try {
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

      set({
        user: responseData.user,
        token: responseData.token,
        loading: false,
      });
      useUIStore().addToast({
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
      useUIStore().addToast({
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

      useUIStore().addToast({
        type: "success",
        message: "Signed In Successfully",
        description: `Successfully Signed In as ${get().user?.email}`,
      });
      return;
    }
  },
}));

registerAccessTokenGetter(() => useAuthStore.getState().token);
