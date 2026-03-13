import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createUserAccount, getAccountById, getUserAccounts } from '../services/accountsService';

export async function createAccount(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { account_name, account_type, balance, currency } = req.body;
  if (!account_name || !account_type || !currency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const account = await createUserAccount({
    user_id: user.id,
    account_name,
    account_type,
    balance: Number(balance || 0),
    currency
  });

  return res.status(201).json(account);
}

export async function listAccounts(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accounts = await getUserAccounts(user.id);
  return res.json(accounts);
}

export async function getAccount(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const account = await getAccountById(req.params.id);
  if (!account || account.user_id !== user.id) {
    return res.status(404).json({ error: 'Account not found' });
  }

  return res.json(account);
}
