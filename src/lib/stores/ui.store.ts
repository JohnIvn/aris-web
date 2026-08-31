import { create } from "zustand";
import type { Toast } from "../data/toast.types";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: "Payroll" | "AR" | "Attendance" | "System";
  createdAt: string;
  read: boolean;
}

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface UIState {
  toasts: Toast[];
  confirmation: ConfirmationState | null;
  notifications: AppNotification[];
  unreadCount: number;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => void;
  hideConfirmation: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const defaultNotifications: AppNotification[] = [
  {
    id: "notif-001",
    title: "Payroll cycle processed",
    message: "Your approved AR for the period August 1–15 has been included in this payroll cycle.",
    category: "Payroll",
    createdAt: "Today, 8:15 AM",
    read: false,
  },
  {
    id: "notif-002",
    title: "AR deadline reminder",
    message: "Your next accomplishment report batch is due on the 15th. Prepare your supporting documents before then.",
    category: "AR",
    createdAt: "Today, 6:40 AM",
    read: false,
  },
  {
    id: "notif-003",
    title: "Attendance summary posted",
    message: "Your attendance summary for this reporting period has been generated and is ready for review.",
    category: "Attendance",
    createdAt: "Yesterday, 4:25 PM",
    read: true,
  },
  {
    id: "notif-004",
    title: "System maintenance",
    message: "The ARIS system will undergo maintenance on Saturday at 11:00 PM for payroll synchronization updates.",
    category: "System",
    createdAt: "Yesterday, 1:05 PM",
    read: false,
  },
  {
    id: "notif-005",
    title: "Report approval notice",
    message: "Your August accomplishment report has been approved and forwarded for payroll calculation.",
    category: "AR",
    createdAt: "Mon, 9:15 AM",
    read: true,
  },
];

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  confirmation: null,
  notifications: defaultNotifications,
  unreadCount: defaultNotifications.filter((item) => !item.read).length,

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

  markNotificationAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      );

      return {
        notifications,
        unreadCount: notifications.filter((notification) => !notification.read).length,
      };
    });
  },

  markAllNotificationsAsRead: () => {
    set((state) => {
      const notifications = state.notifications.map((notification) => ({
        ...notification,
        read: true,
      }));

      return {
        notifications,
        unreadCount: 0,
      };
    });
  },
}));
