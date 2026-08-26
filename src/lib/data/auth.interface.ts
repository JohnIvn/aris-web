import { SettingsThemes } from "./types";

export interface UserSession {
  id: string;
  email: string;
  role: string;
}

export interface UserSettings {
  theme: SettingsThemes;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstname: string;
  middlename: string;
  lastname: string;
  gender?: string;
  birthday: string;
  age?: string | null;
  address?: string | null;
  position?: string | null; // Change this when we know the professor's hierarchy
}
