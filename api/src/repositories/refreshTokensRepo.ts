import { query } from '../db';

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export async function insertRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
  const rows = await query<RefreshTokenRecord>(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
}

export async function findRefreshToken(userId: string, tokenHash: string) {
  const rows = await query<RefreshTokenRecord>(
    `SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2`,
    [userId, tokenHash]
  );
  return rows[0] || null;
}

export async function deleteRefreshToken(tokenHash: string) {
  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
}

export async function deleteUserRefreshTokens(userId: string) {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}
