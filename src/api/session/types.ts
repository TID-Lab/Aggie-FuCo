import { hasId } from "../common";

export interface Session extends hasId {
  email: string;
  hasDefaultPassword: boolean;
  provider: string;
  role: "admin" | "monitor" | undefined;
  username: string;
  __v: number;
}

export interface LoginData {
  username: string;
  password: string;
}
