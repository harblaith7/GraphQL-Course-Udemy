const { ApolloServer, gql } = require("apollo-server");

exports.typeDefs = gql`
  type Query {
    hello: String!
    car(id: ID!): Car!
  }

  type Car {
    id: ID!
    color: String!
    make: String!
  }

  interface Group {
    id: ID!
    name: String!
    imageId: ID!
    bodyHtml: String!
    memberships: [GroupMembership!]!
  }

  type ManualGroup implements Group {
    id: ID!
    name: String!
    imageId: ID!
    bodyHtml: String!
    memberships: [GroupMembership!]!
  }

  type AutomaticGroup implements Group {
    id: ID!
    name: String!
    imageId: ID!
    bodyHtml: String!
    memberships: [GroupMembership!]!
    features: [AutomaticGroupFeatures!]!
    applyFeaturesSeparately: Boolean!
  }

  type AutomaticGroupFeatures {
    column: String!
  }

  type GroupMembership {
    groupId: ID!
    carId: ID!
  }
`;
