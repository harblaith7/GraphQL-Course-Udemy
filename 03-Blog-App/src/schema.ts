import { gql } from "apollo-server-core";

export const typeDefs = gql`
  type Query {
    me: User
    profile(email: String!): Profile
    posts(skip: Int!, take: Int!): [Post!]!
  }

  type Mutation {
    signup(
      credentials: CredentialsInput!
      bio: String!
      name: String!
    ): AuthPayload!
    signin(credentials: CredentialsInput!): AuthPayload!
    postCreate(post: PostInput!): PostPayload!
    postUpdate(postId: ID!, post: PostInput!): PostPayload!
    postPublish(postId: ID!): PostPayload!
    postUnpublish(postId: ID!): PostPayload!
    postDelete(postId: ID!): Boolean!
  }

  type User {
    id: ID!
    name: String
    email: String!
    posts: [Post!]!
    profile: Profile!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    createdAt: String!
    published: Boolean!
    user: User!
  }

  type Profile {
    id: ID!
    bio: String!
    user: User!
  }

  type AuthPayload {
    userErrors: [UserError!]!
    token: String
  }

  type PostPayload {
    userErrors: [UserError!]!
    post: Post
  }

  type UserError {
    message: String!
  }

  input CredentialsInput {
    email: String!
    password: String!
  }

  input PostInput {
    title: String
    content: String
  }
`;
