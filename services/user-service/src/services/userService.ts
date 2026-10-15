import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { AuthUser } from '../middleware/auth';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UserRecord extends PublicUser {
  passwordHash: string;
}

const users: UserRecord[] = [];
const jwtSecret = process.env.JWT_SECRET ?? 'microservice-dev-secret';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function sanitizeUser(user: UserRecord): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function generateToken(user: Pick<AuthUser, 'id' | 'email' | 'name'>): string {
  return jwt.sign(user, jwtSecret, { expiresIn: '1h' });
}

export function registerUser(input: RegisterUserInput): { user: PublicUser; token: string } {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password?.trim();

  if (!name || !email || !password) {
    throw new AppError(400, 'Name, email and password are required');
  }

  if (password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters long');
  }

  const alreadyExists = users.some((user) => user.email === email);
  if (alreadyExists) {
    throw new AppError(409, 'User with this email already exists');
  }

  const newUser: UserRecord = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  return {
    user: sanitizeUser(newUser),
    token: generateToken({ id: newUser.id, email: newUser.email, name: newUser.name }),
  };
}

export function loginUser(input: LoginUserInput): { user: PublicUser; token: string } {
  const email = input.email?.trim().toLowerCase();
  const password = input.password?.trim();

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  const user = users.find((candidate) => candidate.email === email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new AppError(401, 'Invalid email or password');
  }

  return {
    user: sanitizeUser(user),
    token: generateToken({ id: user.id, email: user.email, name: user.name }),
  };
}

export function getUserById(id: string): PublicUser | undefined {
  const user = users.find((candidate) => candidate.id === id);
  return user ? sanitizeUser(user) : undefined;
}

export function getCurrentUser(user: AuthUser): PublicUser {
  const currentUser = getUserById(user.id);

  if (!currentUser) {
    throw new AppError(404, 'User not found');
  }

  return currentUser;
}
