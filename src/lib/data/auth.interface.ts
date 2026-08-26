import { SettingsThemes, UserRoles } from "./types";

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
  confirm_password: string;
  username: string;
  firstname: string;
  middlename: string;
  lastname: string;
  gender?: string;
  birthday?: string;
}

export interface UserData {
  avatar_url?: string;
  email: string;
  username: string;
  firstname: string;
  middlename: string;
  lastname: string;
  gender?: string;
  birthday?: string;
  age?: number;
}
