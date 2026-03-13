import { query } from '../db';

export interface TransactionRecord {
  id: string;
  account_id: string;
  amount: string;
  currency: string;
  merchant: string;
  category: string;
  type: 'debit' | 'credit';
  timestamp: string;
  notes: string | null;
}

export async function createTransaction(params: {
  account_id: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  type: 'debit' | 'credit';
  timestamp: string;
  notes?: string | null;
}) {
  const rows = await query<TransactionRecord>(
    `INSERT INTO transactions (account_id, amount, currency, merchant, category, type, timestamp, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      params.account_id,
      params.amount,
      params.currency,
      params.merchant,
      params.category,
      params.type,
      params.timestamp,
      params.notes || null
    ]
  );
  return rows[0];
}

export async function listTransactionsByUser(userId: string) {
  return query<TransactionRecord>(
    `SELECT t.*
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = $1
     ORDER BY t.timestamp DESC`,
    [userId]
  );
}

export async function listTransactionsByUserSince(userId: string, since: string) {
  return query<TransactionRecord>(
    `SELECT t.*
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = $1 AND t.timestamp >= $2
     ORDER BY t.timestamp DESC`,
    [userId, since]
  );
}

export async function findTransactionById(transactionId: string) {
  const rows = await query<TransactionRecord>('SELECT * FROM transactions WHERE id = $1', [transactionId]);
  return rows[0] || null;
}

export async function findTransactionByIdForUser(transactionId: string, userId: string) {
  const rows = await query<TransactionRecord>(
    `SELECT t.*
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE t.id = $1 AND a.user_id = $2`,
    [transactionId, userId]
  );
  return rows[0] || null;
}

export async function getCurrentBalanceForUser(userId: string) {
  const rows = await query<{ total_balance: string }>(
    'SELECT COALESCE(SUM(balance), 0) AS total_balance FROM accounts WHERE user_id = $1',
    [userId]
  );
  return rows[0]?.total_balance ? Number(rows[0].total_balance) : 0;
}
