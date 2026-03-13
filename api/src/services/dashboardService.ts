import { query } from '../db';

export async function getDashboardMetrics(userId: string) {
  const [balanceRow] = await query<{ total_balance: string }>(
    'SELECT COALESCE(SUM(balance), 0) AS total_balance FROM accounts WHERE user_id = $1',
    [userId]
  );

  const [spendingRow] = await query<{ monthly_spending: string }>(
    `SELECT COALESCE(SUM(amount), 0) AS monthly_spending
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = $1
       AND t.type = 'debit'
       AND t.timestamp >= date_trunc('month', NOW())`,
    [userId]
  );

  const [incomeRow] = await query<{ monthly_income: string }>(
    `SELECT COALESCE(SUM(amount), 0) AS monthly_income
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = $1
       AND t.type = 'credit'
       AND t.timestamp >= date_trunc('month', NOW())`,
    [userId]
  );

  const topCategories = await query<{ category: string; total: string }>(
    `SELECT t.category, COALESCE(SUM(t.amount), 0) AS total
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = $1
       AND t.type = 'debit'
       AND t.timestamp >= date_trunc('month', NOW())
     GROUP BY t.category
     ORDER BY total DESC
     LIMIT 5`,
    [userId]
  );

  const recentTransactions = await query<any>(
    `SELECT t.*
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE a.user_id = $1
     ORDER BY t.timestamp DESC
     LIMIT 6`,
    [userId]
  );

  return {
    total_balance: Number(balanceRow?.total_balance || 0),
    monthly_spending: Number(spendingRow?.monthly_spending || 0),
    monthly_income: Number(incomeRow?.monthly_income || 0),
    top_categories: topCategories.map((row) => ({
      category: row.category,
      total: Number(row.total)
    })),
    recent_transactions: recentTransactions
  };
}
