const { ApolloServer, gql } = require("apollo-server");
const { Category } = require("./resolvers/Category");
const { Query } = require("./resolvers/Query");
const { Product } = require("./resolvers/Product");
const { typeDefs } = require("./schema");
const { categories, products, reviews } = require("./db");

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: {
    Query,
    Product,
    Category,
  },
  context: {
    categories,
    products,
    reviews,
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
