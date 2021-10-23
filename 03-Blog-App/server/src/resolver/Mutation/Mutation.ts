import { authResolvers, postResolver } from ".";

export const Mutation = {
  ...authResolvers,
  ...postResolver,
};
