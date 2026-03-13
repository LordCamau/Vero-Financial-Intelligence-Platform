import { createTransaction, findTransactionByIdForUser, listTransactionsByUser } from '../repositories/transactionsRepo';
import { categorizeTransaction } from './analyticsClient';
import { findAccountById, updateAccountBalance } from '../repositories/accountsRepo';
import { transactionQueue } from '../queue';

export async function createUserTransaction(params: {
  user_id: string;
  account_id: string;
  amount: number;
  currency: string;
  merchant: string;
  type: 'debit' | 'credit';
  timestamp: string;
  notes?: string | null;
}) {
  const account = await findAccountById(params.account_id);
  if (!account || account.user_id !== params.user_id) {
    throw new Error('Account not found');
  }

  let category = 'Other';
  try {
    const result = await categorizeTransaction({
      merchant: params.merchant,
      amount: params.amount,
      type: params.type
    });
    category = result.category || 'Other';
  } catch (error) {
    category = 'Other';
  }

  const transaction = await createTransaction({
    account_id: params.account_id,
    amount: params.amount,
    currency: params.currency,
    merchant: params.merchant,
    category,
    type: params.type,
    timestamp: params.timestamp,
    notes: params.notes
  });

  const balanceDelta = params.type === 'debit' ? -params.amount : params.amount;
  await updateAccountBalance(params.account_id, balanceDelta);

  await transactionQueue.add('transaction.created', {
    transaction_id: transaction.id,
    account_id: params.account_id
  });

  return transaction;
}

export async function getUserTransactions(userId: string) {
  return listTransactionsByUser(userId);
}

export async function getTransactionById(transactionId: string, userId: string) {
  return findTransactionByIdForUser(transactionId, userId);
}
