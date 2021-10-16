const { ApolloServer } = require("apollo-server");
const { typeDefs } = require("./typeDefs/00-Naive-Schema");

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      hello: () => "World",
    },
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
