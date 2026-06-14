import pool from '../db/postgres';
import { User } from '../types/user';

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const { rows } = await pool.query<User>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
    [email, passwordHash]
  );
  return rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ?? null;
}
