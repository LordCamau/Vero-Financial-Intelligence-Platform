import { Request, Response } from 'express';
import { createUser, findUserByEmail } from '../repositories/usersRepo';
import {
  deleteRefreshToken,
  deleteUserRefreshTokens,
  findRefreshToken,
  insertRefreshToken
} from '../repositories/refreshTokensRepo';
import {
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken
} from '../services/authService';

function refreshExpiryDate() {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function register(req: Request, res: Response) {
  const { email, password, full_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const password_hash = hashPassword(password);
  const user = await createUser({ email, password_hash, full_name });

  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });
  const tokenHash = hashToken(refreshToken);

  await insertRefreshToken(user.id, tokenHash, refreshExpiryDate());

  return res.status(201).json({
    user: { id: user.id, email: user.email, full_name: user.full_name },
    access_token: accessToken,
    refresh_token: refreshToken
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  await deleteUserRefreshTokens(user.id);

  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });
  const tokenHash = hashToken(refreshToken);

  await insertRefreshToken(user.id, tokenHash, refreshExpiryDate());

  return res.json({
    user: { id: user.id, email: user.email, full_name: user.full_name },
    access_token: accessToken,
    refresh_token: refreshToken
  });
}

export async function refresh(req: Request, res: Response) {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const payload = verifyRefreshToken(refresh_token);
    const tokenHash = hashToken(refresh_token);
    const existing = await findRefreshToken(payload.id, tokenHash);

    if (!existing) {
      return res.status(401).json({ error: 'Refresh token not recognized' });
    }

    await deleteRefreshToken(tokenHash);

    const accessToken = signAccessToken({ id: payload.id, email: payload.email });
    const newRefreshToken = signRefreshToken({ id: payload.id, email: payload.email });
    const newTokenHash = hashToken(newRefreshToken);
    await insertRefreshToken(payload.id, newTokenHash, refreshExpiryDate());

    return res.json({
      access_token: accessToken,
      refresh_token: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}
