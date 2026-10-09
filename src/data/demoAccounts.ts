export type UserRole = "administrator" | "professor";

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
    email: "admin@aris.edu.ph",
    password: "Admin12345",
    name: "ARIS Administrator",
    role: "administrator",
  },
  {
    id: "professor-demo-001",
    email: "professor@aris.edu.ph",
    password: "Professor123",
    name: "Amelia Torres",
    role: "professor",
  },
];