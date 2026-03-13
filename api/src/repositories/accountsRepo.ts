import { query } from '../db';

export interface AccountRecord {
  id: string;
  user_id: string;
  account_name: string;
  account_type: string;
  balance: string;
  currency: string;
  created_at: string;
}

export async function createAccount(params: {
  user_id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
}) {
  const rows = await query<AccountRecord>(
    `INSERT INTO accounts (user_id, account_name, account_type, balance, currency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [params.user_id, params.account_name, params.account_type, params.balance, params.currency]
  );
  return rows[0];
}

export async function listAccountsByUser(userId: string) {
  return query<AccountRecord>('SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
}

export async function findAccountById(accountId: string) {
  const rows = await query<AccountRecord>('SELECT * FROM accounts WHERE id = $1', [accountId]);
  return rows[0] || null;
}

export async function updateAccountBalance(accountId: string, delta: number) {
  const rows = await query<AccountRecord>(
    'UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING *',
    [delta, accountId]
  );
  return rows[0] || null;
}
