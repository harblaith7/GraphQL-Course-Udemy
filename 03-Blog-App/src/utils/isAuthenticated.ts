import { Context } from "..";

export const isAuthenticated = (userInfo: Context["userInfo"]) => {
  if (!userInfo) return false;
  else return true;
};
