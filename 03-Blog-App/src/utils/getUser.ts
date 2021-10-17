import jwt from "jsonwebtoken";

export const getUser = async (token: string) => {
  try {
    return jwt.verify(token, "fbuywfvy213fv32f23iuf32g32g23") as {
      email: string;
    };
  } catch (error) {
    return null;
  }
};
