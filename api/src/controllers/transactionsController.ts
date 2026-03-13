import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createUserTransaction, getTransactionById, getUserTransactions } from '../services/transactionsService';

export async function createTransaction(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { account_id, amount, currency, merchant, type, timestamp, notes } = req.body;
  if (!account_id || amount === undefined || amount === null || !currency || !merchant || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const transaction = await createUserTransaction({
      user_id: user.id,
      account_id,
      amount: Number(amount),
      currency,
      merchant,
      type,
      timestamp: timestamp || new Date().toISOString(),
      notes
    });

    return res.status(201).json(transaction);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Unable to create transaction' });
  }
}

export async function listTransactions(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const transactions = await getUserTransactions(user.id);
  return res.json(transactions);
}

export async function getTransaction(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const transaction = await getTransactionById(req.params.id, user.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  return res.json(transaction);
}
