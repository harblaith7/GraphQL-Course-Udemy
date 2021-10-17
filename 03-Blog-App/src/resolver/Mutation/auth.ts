import validator from "validator";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { Context } from "../..";

interface SignupArgsTypes {
  credentials: {
    email: string;
    password: string;
  };
  bio: string;
  name?: string;
}

interface SigninArgsTypes {
  credentials: {
    email: string;
    password: string;
  };
}

interface AuthPayload {
  userErrors: {
    message: string;
  }[];
  token: string | null;
}

export const authResolvers = {
  signup: async (
    _: any,
    { credentials, name, bio }: SignupArgsTypes,
    { prisma }: Context
  ): Promise<AuthPayload> => {
    const { email, password } = credentials;

    const isEmail = validator.isEmail(email);
    const isValidPassword = validator.isLength(password, {
      min: 5,
    });

    if (!isEmail) {
      return {
        userErrors: [
          {
            message: "Email is invalid",
          },
        ],
        token: null,
      };
    }

    if (!isValidPassword) {
      return {
        userErrors: [
          {
            message: "Password is invalid",
          },
        ],
        token: null,
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return {
        userErrors: [{ message: "User with email already exists" }],
        token: null,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = await JWT.sign({ email }, "fbuywfvy213fv32f23iuf32g32g23", {
      expiresIn: 360000,
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    await prisma.profile.create({
      data: {
        bio,
        userId: user.id,
      },
    });

    return {
      userErrors: [],
      token,
    };
  },
  signin: async (
    _: any,
    { credentials }: SigninArgsTypes,
    { prisma }: Context
  ): Promise<AuthPayload> => {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return {
        userErrors: [{ message: "Invalid credentials" }],
        token: null,
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {
        userErrors: [{ message: "Invalid credentials" }],
        token: null,
      };
    }

    return {
      userErrors: [],
      token: JWT.sign({ email }, "fbuywfvy213fv32f23iuf32g32g23", {
        expiresIn: 360000,
      }),
    };
  },
};
