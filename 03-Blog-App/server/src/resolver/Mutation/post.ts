import { Context } from "../..";
import { isAuthenticated, userCanMutatePost } from "../../utils";
import { Post, Prisma } from ".prisma/client";

interface PostTypes {
  post: {
    title?: string;
    content?: string;
  };
}

interface PostPayload {
  userErrors: {
    message: string;
  }[];
  post: Prisma.Prisma__PostClient<Post> | Post | null;
}

export const postResolver = {
  postCreate: async (
    _: any,
    { post }: PostTypes,
    { prisma, userInfo }: Context
  ): Promise<PostPayload> => {
    if (!isAuthenticated(userInfo)) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }

    const { title, content } = post;

    if (!title || !content) {
      return {
        userErrors: [
          {
            message: "Need to have title and content to create a post",
          },
        ],
        post: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userInfo!.email,
      },
    });

    if (!user) {
      return {
        userErrors: [
          {
            message: "User not found",
          },
        ],
        post: null,
      };
    }

    return {
      userErrors: [],
      post: prisma.post.create({
        data: {
          title,
          content,
          published: false,
          authorId: user.id,
        },
      }),
    };
  },
  postDelete: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayload> => {
    if (!isAuthenticated(userInfo)) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }

    const error = await userCanMutatePost({
      prisma,
      id: postId,
      email: userInfo!.email,
    });

    if (error) return error;

    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!post) {
      return {
        userErrors: [
          {
            message: "Post does not exist",
          },
        ],
        post: null,
      };
    }

    await prisma.post.delete({
      where: {
        id: Number(postId),
      },
    });

    return {
      userErrors: [],
      post,
    };
  },
  postUpdate: async (
    _: any,
    { postId, post }: { postId: string; post: PostTypes["post"] },
    { prisma, userInfo }: Context
  ): Promise<PostPayload> => {
    if (!isAuthenticated(userInfo)) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }

    const error = await userCanMutatePost({
      prisma,
      id: postId,
      email: userInfo!.email,
    });

    if (error) return error;

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!existingPost) {
      return {
        userErrors: [
          {
            message: "Post does not exist",
          },
        ],
        post: null,
      };
    }

    const { title, content } = post;

    if (!title && !content) {
      return {
        userErrors: [
          {
            message: "Need to have at least one field to update",
          },
        ],
        post: null,
      };
    }

    let payloadToUpdate = {
      title,
      content,
    };

    if (!title) delete payloadToUpdate.title;
    if (!content) delete payloadToUpdate.content;

    return {
      userErrors: [],
      post: prisma.post.update({
        where: {
          id: Number(postId),
        },
        data: {
          ...payloadToUpdate,
        },
      }),
    };
  },
  postPublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayload> => {
    if (!isAuthenticated(userInfo)) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }

    const error = await userCanMutatePost({
      prisma,
      id: postId,
      email: userInfo!.email,
    });

    if (error) return error;

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!existingPost) {
      return {
        userErrors: [
          {
            message: "Post does not exist",
          },
        ],
        post: null,
      };
    }

    return {
      userErrors: [],
      post: prisma.post.update({
        where: {
          id: Number(postId),
        },
        data: {
          published: true,
        },
      }),
    };
  },
  postUnpublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayload> => {
    if (!isAuthenticated(userInfo)) {
      return {
        userErrors: [
          {
            message: "Forbidden access (unauthenticated)",
          },
        ],
        post: null,
      };
    }

    const error = await userCanMutatePost({
      prisma,
      id: postId,
      email: userInfo!.email,
    });

    if (error) return error;

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!existingPost) {
      return {
        userErrors: [
          {
            message: "Post does not exist",
          },
        ],
        post: null,
      };
    }

    return {
      userErrors: [],
      post: prisma.post.update({
        where: {
          id: Number(postId),
        },
        data: {
          published: false,
        },
      }),
    };
  },
};
