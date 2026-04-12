import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { validateEmail, validatePassword } from "../../lib/validators.js";
import { JWT_EXPIRES_IN, BCRYPT_ROUNDS } from "../../lib/constants.js";

export async function login(email, password) {
  validateEmail(email);
  validatePassword(password);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

  // Apenas id e role no token — dados sensíveis ficam fora
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return token;
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
