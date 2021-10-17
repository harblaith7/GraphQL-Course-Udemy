import { Context } from "..";
import createError from "http-errors";

export const Query = {
  me: (_: any, __: any, { prisma, userInfo }: Context) => {
    if (!userInfo) return null;
    return prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  },
  profile: async (
    _: any,
    { email }: { email: string },
    { prisma }: Context
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return createError(404, "User not found");
    }

    return prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });
  },
  posts: async (
    _: any,
    {
      skip,
      take,
    }: {
      skip: number;
      take: number;
    },
    { prisma }: Context
  ) => {
    return await prisma.post.findMany({
      orderBy: [{ createdAt: "desc" }],
      skip,
      take,
    });
  },
};
