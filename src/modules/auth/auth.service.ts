import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { RegisterInput, LoginInput } from "./auth.schema";
import { signJWT, JWTPayload } from "./auth.jwt";
import { Role } from "./auth.rbac";

export async function registerUser(input: RegisterInput) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error("A user with this email address already exists.");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name || input.email.split("@")[0].toUpperCase(),
      role: input.role as Role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = await signJWT({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
    name: user.name,
  });

  return { user, token };
}

export async function loginUser(input: LoginInput) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password.");
  }

  // Verify password
  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  // Generate JWT token
  const token = await signJWT({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
    name: user.name,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          memes: true,
          collections: true,
        },
      },
    },
  });

  return user;
}
