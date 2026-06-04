import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/api.error.js";
import { verifyAccessToken } from "../utils/generate.token.js";
import db from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof usersTable>;
type AuthenticatedUser = Pick<
  User,
  | "id"
  | "firstName"
  | "email"
  | "role"
  | "lastName"
  | "createdAt"
  | "updatedAt"
  | "isVerified"
>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies.accessToken ?? req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw ApiError.notFound("Please log in to continue ");
  }

  const decodedToken = verifyAccessToken(token);

  const [user] = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      email: usersTable.email,
      role: usersTable.role,
      isVerified: usersTable.isVerified,
      lastName: usersTable.lastName,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.id, decodedToken.id),
        eq(usersTable.isDeleted, false),
        eq(usersTable.isVerified, true),
      ),
    );

  if (!user) {
    throw ApiError.notFound("User account no longer exists");
  }

  req.user = user;

  next();
}

export { authenticate };
