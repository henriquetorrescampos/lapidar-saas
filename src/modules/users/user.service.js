import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from "../../lib/validators.js";
import { BCRYPT_ROUNDS } from "../../lib/constants.js";

export async function createUser(data) {
  validateRequired(data.email, "Email");
  validateRequired(data.password, "Password");
  validateEmail(data.email);
  validatePassword(data.password);

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "user",
      unit: data.unit || "SENADOR CANEDO",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      unit: true,
    },
  });
}

export async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      unit: true,
    },
  });
}

export async function deleteUser(id) {
  validateRequired(id, "User ID");

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.user.delete({
    where: { id: parseInt(id) },
  });
}
