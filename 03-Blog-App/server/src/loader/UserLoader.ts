import { User } from ".prisma/client";
import Dataloader from "dataloader";
import { prisma } from "..";

type BatchUser = (ids: any) => Promise<User[]>;

const batchUsers: BatchUser = async (ids) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  const userMap: { [key: string]: User } = {};
  users.forEach((u) => {
    userMap[u.id] = u;
  });

  return ids.map((id: any) => userMap[id]);
};

export const userLoader = new Dataloader<number, User>(batchUsers);
