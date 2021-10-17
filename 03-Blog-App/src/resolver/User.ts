import { Context } from "..";

interface UserType {
  id: number;
  email: string;
  name: string;
}

export const User = {
  posts: async (parent: UserType, __: any, { prisma, userInfo }: Context) => {
    const isOwnProfile = parent.email === userInfo?.email;

    if (isOwnProfile) {
      return prisma.post.findMany({
        where: {
          authorId: parent.id,
        },
        orderBy: [{ createdAt: "desc" }],
      });
    } else {
      return prisma.post.findMany({
        where: {
          authorId: parent.id,
          published: true,
        },
        orderBy: [{ createdAt: "desc" }],
      });
    }
  },
};
