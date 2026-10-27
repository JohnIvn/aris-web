export type UserRole = "administrator" | "staff" | "admin";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  position?: string | null;
  department?: string | null;
  avatar_url?: string | null;
}

export interface DemoAccount extends UserAccount {
  password: string;
}

export const demoAccounts: DemoAccount[] = [];
