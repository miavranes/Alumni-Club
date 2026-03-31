import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { PrismaClient } from '@prisma/client';

type users = Awaited<ReturnType<PrismaClient['users']['findUniqueOrThrow']>>;

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRES_IN = '7d';

export async function registerUser(payload: { 
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  enrollmentYear: number;
  role?: string;
  profilePicture?: string;
  occupation?: string;
}) {
  const hash = await bcrypt.hash(payload.password, 10);
  
  return prisma.users.create({
    data: {
      username: payload.username,
      email: payload.email,
      password_hash: hash,
      first_name: payload.firstName,
      last_name: payload.lastName,
      enrollment_year: payload.enrollmentYear,
      role: payload.role || 'user',
      profile_picture: payload.profilePicture,
      occupation: payload.occupation,
      is_active: true,
    },
  });
}

export async function findUserByEmail(email: string): Promise<users | null> {
  return prisma.users.findUnique({ where: { email } });
}

export async function findUserByUsername(username: string): Promise<users | null> {
  return prisma.users.findFirst({ 
    where: { username } 
  });
}

export async function validatePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createToken(user: users) {
  const payload = { 
    sub: user.id, 
    username: user.username, 
    email: user.email,
    role: user.role 
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

export const getUserById = async (id: number): Promise<users | null> => {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
    });
    return user;
  } catch (error: any) {
    throw new Error('Error fetching user: ' + (error.message || error));
  }
};

export const updateUser = async (id: number, data: any) => {
  try {
    const user = await prisma.users.update({
      where: { id },
      data,
    });
    return user;
  } catch (error: any) {
    throw new Error('Error updating user: ' + (error.message || error));
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await prisma.users.delete({
      where: { id },
    });
  } catch (error: any) {
    throw new Error('Error deleting user: ' + (error.message || error));
  }
};

/**
 * loginUser - finds the user by email (or username if you prefer), verifies password,
 * and returns a safe user object plus JWT token.
 */
export const loginUser = async (username: string, password: string) => {
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    // Use password_hash field for comparison
    const ok = await validatePassword(password, user.password_hash);
    if (!ok) {
      throw new Error('Invalid credentials');
    }

    const token = await createToken(user);

    // Return safe user object without password_hash
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      enrollment_year: user.enrollment_year,
      role: user.role,
      profile_picture: user.profile_picture,
      occupation: user.occupation,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return { user: safeUser, token };
  } catch (error: any) {
    throw new Error('Error logging in: ' + (error.message || error));
  }
};