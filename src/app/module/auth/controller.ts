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
  generateVerificationToken,
  hashToken,
} from "../../common/utils/generate.token.js";
import transpoter from "../../common/utils/email.js";

async function register(req: Request, res: Response) {
  const body = registerValidationSchema.safeParse(req.body);

  if (body.error) {
    const [errors] = body.error.issues.map((e) => e.message);
    throw ApiError.badRequest(errors);
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, body.data.email));

  if (user) {
    throw ApiError.conflict(
      `user with this email ${body.data.email} already exist`,
    );
  }

  const hashPass = await hashPassword(body.data.password);
  const { rawVerificationToken, hashVerificationToken } =
    generateVerificationToken();

  const [data] = await db
    .insert(usersTable)
    .values({
      email: body.data.email,
      firstName: body.data.firstName,
      lastName: body.data.lastName,
      password: hashPass,
      verificationToken: hashVerificationToken,
    })
    .returning({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      isVerified: usersTable.isVerified,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    });

  await transpoter.sendMail({
    from: "test@test.com",
    to: data?.email,
    subject: "Please verified your account",
    html: `  <a href="http://localhost:8000/api/v1/auth/verify-email/${rawVerificationToken}">
    Verify Email
  </a>`,
  });

  ApiResponse.created(
    res,
    "Account created successfully. Please verify your email",
    { user: data },
  );
}

async function verifyEmail(req: Request, res: Response) {
  const { token } = req.params;

  if (!token) {
    ApiError.unauthorized("invalid or expired token");
  }

  const hashedToken = await hashToken(token as string);

  const [data] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.verificationToken, hashedToken));

  if (!data) {
    throw ApiError.notFound("Invalid verification link");
  }

  await db
    .update(usersTable)
    .set({ isVerified: true, verificationToken: "" })
    .where(eq(usersTable.id, data?.id!));

  ApiResponse.ok(res, "Your account has been verified successfully");
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

  if (!user.isVerified) {
    throw ApiError.unauthorized("Please verify your email before logging in");
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
      isVerified: usersTable.isVerified,
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

  ApiResponse.ok(res, "Logged in successfully", {
    user: data,
    accessToken,
    refreshToken,
  });
}

async function logout(req: Request, res: Response) {
  const user = req.user;
  await db
    .update(usersTable)
    .set({ refreshToken: "" })
    .where(eq(usersTable.id, user?.id!));
  res.clearCookie("accessToken").clearCookie("refreshToken");

  ApiResponse.ok(res, "Logged out successfully");
}


async function getMe(req: Request, res: Response) {
  const user = req.user;
  ApiResponse.ok(res, "User fetched successfully", { user: user });
}


export { register, login, logout, getMe, verifyEmail };
