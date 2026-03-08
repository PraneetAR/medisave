import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Types } from "mongoose";

export interface TokenPayload {
  userId: string;
  email: string;
}

const signToken = (payload: TokenPayload, secret: string, expiresIn: string): string => {
  // ✅ Fix: build options separately then cast — avoids StringValue conflict
  const options = { expiresIn } as SignOptions;
  return jwt.sign(payload, secret, options);
};

export const generateAccessToken = (payload: TokenPayload): string => {
  return signToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return signToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

export const generateTokenPair = (userId: Types.ObjectId, email: string) => {
  const payload: TokenPayload = { userId: userId.toString(), email };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};