import { Context } from "..";
import { userLoader } from "../loader/UserLoader";

interface PostType {
  title: string;
  content: string;
  authorId: number;
}

export const Post = {
  user: async (parent: PostType, __: any, { prisma }: Context) => {
    return userLoader.load(parent.authorId);
  },
};
