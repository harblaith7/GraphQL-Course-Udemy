import createError from "http-errors";
import { Context } from "..";

interface UserCanMutatePostParams {
  prisma: Context["prisma"];
  email: string;
  id: string;
}

export const userCanMutatePost = async ({
  email,
  prisma,
  id,
}: UserCanMutatePostParams) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
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

  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (post?.authorId !== user.id) {
    return {
      userErrors: [
        {
          message: "Post not owned by user",
        },
      ],
      post: null,
    };
  }
};
