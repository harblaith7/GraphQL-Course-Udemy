import { ApolloServer } from "apollo-server-express";
import express from "express";
import { Query, Mutation, Profile, User, Post } from "./resolver";
import { typeDefs } from "./schema";

import { PrismaClient, Prisma } from "@prisma/client";
import { getUser } from "./utils";

export const prisma = new PrismaClient();
export interface Context {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  userInfo: { email: string } | null;
}

const main = async () => {
  const resolvers = {
    Query,
    Mutation,
    Profile,
    User,
    Post,
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: any): Promise<Context> => {
      const userInfo = await getUser(req.headers.authorization);
      return {
        prisma,
        userInfo,
      };
    },
  });

  const app = express();
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4001 }, () =>
    console.log("Now browse to http://localhost:4000" + server.graphqlPath)
  );
};

main();
