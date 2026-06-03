import Jwt from "jsonwebtoken";
import crypto from "crypto";

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

async function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export { generateAccessToken, generateRefreshToken, hashToken };
