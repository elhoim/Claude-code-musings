import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import type { CreateUserInput, LoginInput, AuthTokens } from '@linguaflow/shared';
import { ERROR_CODES } from '@linguaflow/shared';
import { db } from '../db/client.js';
import { users, userPreferences } from '../db/schema.js';
import { env } from '../config/env.js';

const SALT_ROUNDS = 12;

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

interface JwtPayload {
  sub: string;
  email: string;
}

function generateTokens(user: { id: string; email: string }): AuthTokens {
  const payload: JwtPayload = { sub: user.id, email: user.email };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });

  const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
  const expiresIn = decoded.exp! - Math.floor(Date.now() / 1000);

  return { accessToken, refreshToken, expiresIn };
}

export async function register(input: CreateUserInput): Promise<AuthTokens> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existing) {
    throw new AppError(409, ERROR_CODES.EMAIL_ALREADY_EXISTS, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      nativeLanguage: input.nativeLanguage,
    })
    .returning({ id: users.id, email: users.email });

  // Create default preferences for the new user
  await db.insert(userPreferences).values({
    userId: user.id,
  });

  return generateTokens(user);
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (!user) {
    throw new AppError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    throw new AppError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
  }

  return generateTokens({ id: user.id, email: user.email });
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });

    if (!user) {
      throw new AppError(401, ERROR_CODES.REFRESH_TOKEN_INVALID, 'User not found');
    }

    return generateTokens({ id: user.id, email: user.email });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, ERROR_CODES.REFRESH_TOKEN_INVALID, 'Invalid or expired refresh token');
  }
}

export { generateTokens };
