const { gql } = require("apollo-server-core");

exports.typeDefs = gql`
  type Product {
    id: Int!
    name: String!
    description: String!
    quantity: Int!
    price: Float!
    image: String!
    onSale: Boolean!
    category: Category!
    reviews: [Review!]!
  }

  type Review {
    id: Int!
    date: String!
    title: String!
    comment: String!
    rating: Int!
  }

  type Category {
    id: Int!
    name: String!
    products: [Product!]!
  }

  type Query {
    products(filter: filter): [Product!]!
    product(id: Int!): Product!
    categories: [Category!]!
    category(id: Int!): Category!
  }

  input filter {
    rating: Int!
  }
`;
