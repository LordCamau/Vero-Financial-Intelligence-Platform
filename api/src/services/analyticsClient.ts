import axios from 'axios';
import { config } from '../config';

const analyticsApi = axios.create({
  baseURL: config.ANALYTICS_URL,
  timeout: 8000
});

export async function categorizeTransaction(input: {
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
}) {
  const response = await analyticsApi.post('/categorize', input);
  return response.data as { category: string };
}

export async function getSubscriptions(transactions: any[]) {
  const response = await analyticsApi.post('/insights/subscriptions', { transactions });
  return response.data;
}

export async function getAnomalies(transactions: any[]) {
  const response = await analyticsApi.post('/insights/anomalies', { transactions });
  return response.data;
}

export async function getCashflow(transactions: any[], currentBalance: number) {
  const response = await analyticsApi.post('/insights/cashflow', {
    transactions,
    current_balance: currentBalance
  });
  return response.data;
}

export async function getHealthScore(transactions: any[]) {
  const response = await analyticsApi.post('/insights/health', { transactions });
  return response.data;
}
