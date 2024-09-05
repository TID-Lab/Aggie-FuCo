import { hasId } from "../common";

export interface Credential extends hasId {
  id: string;
  name: string;
  type: string;
  secrets: {
    dashboardAPIToken: string;
  };
  __v: number;
}
