import Jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "./api.error.js";

export interface TokenPayload {
  id: string;
  role: string;
}

function generateAccessToken(payload: TokenPayload) {
  return Jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY as "15m",
  });
}

function generateRefreshToken(payload: TokenPayload) {
  return Jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY as "7d",
  });
}

function verifyAccessToken(token: string): TokenPayload {
  try {
    return Jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET!,
    ) as TokenPayload;
  } catch (error) {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
}

function verifyRefreshToken(token: string): TokenPayload {
  try {
    return Jwt.verify(
      token,
      process.env.JWT_REFRESH_TOKEN_SECRET!,
    ) as TokenPayload;
  } catch (error) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
}

async function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateVerificationToken() {
  const rawVerificationToken = crypto.randomBytes(32).toString("hex");
  const hashVerificationToken = crypto
    .createHash("sha256")
    .update(rawVerificationToken)
    .digest("hex");

  return { rawVerificationToken, hashVerificationToken };
}

export {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateVerificationToken,
};
