import { listTransactionsByUserSince, getCurrentBalanceForUser } from '../repositories/transactionsRepo';
import { getAnomalies, getCashflow, getHealthScore, getSubscriptions } from './analyticsClient';

function monthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

export async function fetchSubscriptions(userId: string) {
  const transactions = await listTransactionsByUserSince(userId, monthsAgo(12));
  return getSubscriptions(transactions);
}

export async function fetchAnomalies(userId: string) {
  const transactions = await listTransactionsByUserSince(userId, monthsAgo(6));
  return getAnomalies(transactions);
}

export async function fetchCashflow(userId: string) {
  const transactions = await listTransactionsByUserSince(userId, monthsAgo(6));
  const currentBalance = await getCurrentBalanceForUser(userId);
  return getCashflow(transactions, currentBalance);
}

export async function fetchHealthScore(userId: string) {
  const transactions = await listTransactionsByUserSince(userId, monthsAgo(3));
  return getHealthScore(transactions);
}
