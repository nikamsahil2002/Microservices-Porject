import bcrypt from 'bcryptjs';
import crypto, {randomUUID} from 'crypto';
import jwt from 'jsonwebtoken';
import {
  BadRequestError,
  CustomError,
  DataFoundError,
  InternalServerError,
  UnauthorizedError,
} from '../utils/customError';
import {AuthUser} from '../middleware/auth';
import {config} from '../config';
import {RefreshTokenModel} from '../models/refreshTokenModel';
import {UserModel} from '../models/userModel';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const accessTokenLifetime = 15 * 60 * 1000;
const refreshTokenLifetime = 7 * 24 * 60 * 60 * 1000;

function toPublicUser(user: {
  _id: {toString(): string};
  name: string;
  email: string;
  createdAt: Date;
}): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createTokenPair(user: PublicUser): Promise<AuthTokens> {
  const identity = {id: user.id, email: user.email, name: user.name};
  const accessToken = jwt.sign({...identity, tokenType: 'access'}, config.jwtSecret, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({...identity, tokenType: 'refresh'}, config.refreshTokenSecret, {
    expiresIn: '7d',
    jwtid: randomUUID(),
  });

  await RefreshTokenModel.create({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshTokenLifetime),
  });

  return {accessToken, refreshToken};
}

export async function registerUser(
  input: RegisterUserInput,
): Promise<{user: PublicUser} & AuthTokens> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password?.trim();

  const existingUser = await UserModel.findOne({email});
  if (existingUser) {
    throw new DataFoundError('User with this email already exists');
  }

  const userPayload = {
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
  };

  const newUser = await UserModel.create(userPayload);
  if (!newUser) {
    throw new InternalServerError('Unable to create user');
  }

  const user = toPublicUser(newUser);
  const tokens = await createTokenPair(user);

  return {
    user,
    ...tokens,
  };
}

export async function loginUser(input: LoginUserInput): Promise<{user: PublicUser} & AuthTokens> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password?.trim();

  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  const userRecord = await UserModel.findOne({email});
  if (!userRecord || !(await bcrypt.compare(password, userRecord.passwordHash))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const user = toPublicUser(userRecord);
  return {
    user,
    ...(await createTokenPair(user)),
  };
}

interface RefreshTokenPayload extends AuthUser {
  tokenType: 'refresh';
}

function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, config.refreshTokenSecret) as RefreshTokenPayload;
    if (payload.tokenType !== 'refresh') {
      throw new Error('Wrong token type');
    }
    return payload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

export async function refreshAuthTokens(refreshToken: string | undefined): Promise<AuthTokens> {
  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required');
  }

  const payload = verifyRefreshToken(refreshToken);
  const session = await RefreshTokenModel.findOneAndUpdate(
    {
      userId: payload.id,
      tokenHash: hashRefreshToken(refreshToken),
      revokedAt: null,
      expiresAt: {$gt: new Date()},
    },
    {revokedAt: new Date()},
    {new: false},
  );

  if (!session) {
    throw new UnauthorizedError('Refresh token has been revoked or already used');
  }

  const userRecord = await UserModel.findById(payload.id);
  if (!userRecord) {
    throw new UnauthorizedError('User for this refresh token no longer exists');
  }

  return createTokenPair(toPublicUser(userRecord));
}

export async function revokeRefreshToken(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required');
  }

  const payload = verifyRefreshToken(refreshToken);
  await RefreshTokenModel.updateOne(
    {
      userId: payload.id,
      tokenHash: hashRefreshToken(refreshToken),
      revokedAt: null,
    },
    {revokedAt: new Date()},
  );
}

export async function getUserById(id: string): Promise<PublicUser | undefined> {
  const userRecord = await UserModel.findById(id);
  return userRecord ? toPublicUser(userRecord) : undefined;
}

export async function getCurrentUser(user: AuthUser): Promise<PublicUser> {
  const currentUser = await getUserById(user.id);

  if (!currentUser) {
    throw new CustomError('User not found', 404);
  }

  return currentUser;
}
