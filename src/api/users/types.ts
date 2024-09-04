import { hasId } from "../common";

export interface User extends hasId {
  provider: string;
  hasDefaultPassword: boolean;
  role: string;
  email: string;
  username: string;
  __v: number;
}

export interface UserCreationData extends UserEditableData {
  password: string;
}

export interface UserEditableData {
  username: string;
  email: string;
  role: "viewer" | "monitor" | "admin";
  _id?: string;
}
