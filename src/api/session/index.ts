import axios from "axios";
import { LoginData, Session } from "./types";

export const logIn = async (loginData: LoginData) => {
  const { data } = await axios.request({
    method: "POST",
    url: "/login",
    data: loginData,
  });

  return data;
};

export const getSession = async () => {
  const { data } = await axios.get<Session>("/session", {
    withCredentials: true,
  });
  return data;
};
export const getSession_untyped = async () => {
  const { data } = await axios.get("/session", { withCredentials: true });
  return data;
};
export const logOut = async () => {
  const { data } = await axios.post("/logout", { withCredentials: true });
  return data;
};
