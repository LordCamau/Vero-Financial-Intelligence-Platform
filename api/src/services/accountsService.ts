import { createAccount, findAccountById, listAccountsByUser } from '../repositories/accountsRepo';

export async function createUserAccount(params: {
  user_id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
}) {
  return createAccount(params);
}

export async function getUserAccounts(userId: string) {
  return listAccountsByUser(userId);
}

export async function getAccountById(accountId: string) {
  return findAccountById(accountId);
}
