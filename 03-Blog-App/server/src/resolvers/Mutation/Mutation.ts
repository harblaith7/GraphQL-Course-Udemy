import { authResolvers } from "./auth";
import { postResolvers } from "./post";

export const Mutation = {
  ...postResolvers,
  ...authResolvers,
};
