import { Context } from "..";

interface ProfileType {
  id: number;
  bio: string;
  userId: number;
}

export const Profile = {
  user: async (parent: ProfileType, __: any, { prisma }: Context) => {
    return prisma.user.findUnique({
      where: {
        id: parent.userId,
      },
    });
  },
};
