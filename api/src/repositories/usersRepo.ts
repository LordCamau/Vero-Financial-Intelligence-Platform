import { query } from '../db';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  created_at: string;
}

export async function findUserByEmail(email: string) {
  const rows = await query<UserRecord>('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function findUserById(id: string) {
  const rows = await query<UserRecord>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createUser(params: {
  email: string;
  password_hash: string;
  full_name?: string | null;
}) {
  const rows = await query<UserRecord>(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [params.email, params.password_hash, params.full_name || null]
  );
  return rows[0];
}
