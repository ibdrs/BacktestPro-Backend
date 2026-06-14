import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/user.repository';
import { AuthPayload } from '../types/user';

export async function register(email: string, password: string) {
  const existing = await userRepo.findUserByEmail(email);
  if (existing) throw new Error('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser(email, passwordHash);
  return { id: user.id, email: user.email };
}

export async function login(email: string, password: string) {
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const payload: AuthPayload = { userId: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return { token, user: { id: user.id, email: user.email } };
}
