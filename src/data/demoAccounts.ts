export type UserRole = "administrator" | "staff" | "admin";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string | null;
}

export interface DemoAccount extends UserAccount {
  password: string;
}

export const demoAccounts: DemoAccount[] = [];
export const demoAccounts: DemoAccount[] = [];