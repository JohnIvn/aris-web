export type UserRole = "administrator" | "staff" | "admin";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface DemoAccount extends UserAccount {
  password: string;
}

export const demoAccounts: DemoAccount[] = [];