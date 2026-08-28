import { create } from "zustand";
import type { Toast } from "../data/toast.types";

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface UIState {
  toasts: Toast[];
  confirmation: ConfirmationState | null;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => void;
  hideConfirmation: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  confirmation: null,

  addToast: (toast) => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  showConfirmation: (title, message, onConfirm) => {
    set({
      confirmation: {
        isOpen: true,
        title,
        message,
        onConfirm,
      },
    });
  },

  hideConfirmation: () => {
    set({ confirmation: null });
  },
}));
