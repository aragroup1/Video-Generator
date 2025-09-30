import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface UserPayload {
  id: string;
  email: string;
  name: string | null;
}

// Hardcoded single user
const SINGLE_USER = {
  id: 'single-user',
  email: 'admin@localhost',
  name: 'Admin',
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string | null,
    };
  } catch {
    return null;
  }
}

export async function getUser(): Promise<UserPayload | null> {
  // For single user, always return the same user
  return SINGLE_USER;
}

export async function requireAuth(): Promise<UserPayload> {
  // For single user, always return the same user
  return SINGLE_USER;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

// Initialize single user on first run
export async function initializeSingleUser() {
  try {
    const existingUser = await prisma.user.findFirst();
    
    if (!existingUser) {
      const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'changeme');
      
      const user = await prisma.user.create({
        data: {
          id: SINGLE_USER.id,
          email: SINGLE_USER.email,
          name: SINGLE_USER.name,
          passwordHash: hashedPassword,
        },
      });

      // Create default project
      await prisma.project.create({
        data: {
          name: 'Main Project',
          description: 'Default project',
          userId: user.id,
        },
      });

      console.log('Single user initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing single user:', error);
  }
}
