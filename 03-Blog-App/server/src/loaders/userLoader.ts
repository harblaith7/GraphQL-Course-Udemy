import { User } from ".prisma/client";
import Dataloader from "dataloader";
import { prisma } from "..";

type BatchUser = (ids: number[]) => Promise<User[]>;

const batchUsers: BatchUser = async (ids) => {
  console.log(ids);
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  const userMap: { [key: string]: User } = {};

  users.forEach((user) => {
    userMap[user.id] = user;
  });

  return ids.map((id) => userMap[id]);
};

//@ts-ignore
export const userLoader = new Dataloader<number, User>(batchUsers);
