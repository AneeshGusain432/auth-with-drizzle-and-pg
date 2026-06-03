import type { Request, Response } from "express";
import {
  loginValidationSchema,
  registerValidationSchema,
} from "./auth.validation.js";
import ApiError from "../../common/utils/api.error.js";
import db from "../../common/db/index.js";
import { usersTable } from "../../common/db/schema.js";
import { eq } from "drizzle-orm";
import {
  comparePassword,
  hashPassword,
} from "../../common/utils/password.hash.js";
import ApiResponse from "../../common/utils/api.response.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../../common/utils/generate.token.js";

async function register(req: Request, res: Response) {
  const body = registerValidationSchema.safeParse(req.body);

  if (body.error) {
    const [errors] = body.error.issues.map((e) => e.message);
    throw ApiError.badRequest(errors);
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, body.data.email));

  if (user.length > 0) {
    throw ApiError.conflict(
      `user with this email ${body.data.email} already exist`,
    );
  }

  const hashPass = await hashPassword(body.data.password);

  const [data] = await db
    .insert(usersTable)
    .values({
      email: body.data.email,
      firstName: body.data.firstName,
      lastName: body.data.lastName,
      password: hashPass,
    })
    .returning({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      isVerified: usersTable.isVerfied,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    });

  ApiResponse.created(res, "register successfully", { user: data });
}

async function login(req: Request, res: Response) {
  const body = loginValidationSchema.safeParse(req.body);

  if (body.error) {
    const [errors] = body.error.issues.map((e) => e.message);
    throw ApiError.badRequest(errors);
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, body.data.email));

  if (!user) {
    throw ApiError.unauthorized("invalid email or password");
  }

  const isValid = await comparePassword(body.data.password, user.password!);

  if (!isValid) {
    throw ApiError.unauthorized("invalid email or password");
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role! });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role! });

  // always store hash token in db
  const hashedToken = await hashToken(refreshToken);

  const [data] = await db
    .update(usersTable)
    .set({ refreshToken: hashedToken })
    .where(eq(usersTable.id, user.id))
    .returning({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      isVerified: usersTable.isVerfied,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    });

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

  ApiResponse.ok(res, "logged in successfully", {
    user: data,
    accessToken,
    refreshToken,
  });
}

export { register, login };
