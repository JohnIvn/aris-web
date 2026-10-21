export type UserRole = "administrator";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface DemoAccount extends UserAccount {
  password: string;
}

export const demoAccounts: DemoAccount[] = [
  {
    id: "admin-demo-001",
    email: "admin@ucc.edu.ph",
    password: "Admin12345",
    name: "ARIS Administrator",
    role: "administrator",
  },
];