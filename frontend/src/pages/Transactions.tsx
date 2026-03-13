import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Account {
  id: string;
  account_name: string;
}

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  type: string;
  timestamp: string;
}

const TransactionsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState({
    account_id: '',
    amount: '0',
    currency: 'USD',
    merchant: '',
    type: 'debit',
    timestamp: '',
    notes: ''
  });

  const fetchData = async () => {
    const [accountsRes, transactionsRes] = await Promise.all([
      api.get('/accounts'),
      api.get('/transactions')
    ]);
    setAccounts(accountsRes.data || []);
    setTransactions(transactionsRes.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post('/transactions', {
      account_id: form.account_id,
      amount: Number(form.amount),
      currency: form.currency,
      merchant: form.merchant,
      type: form.type,
      timestamp: form.timestamp || undefined,
      notes: form.notes || undefined
    });

    setForm({
      account_id: '',
      amount: '0',
      currency: 'USD',
      merchant: '',
      type: 'debit',
      timestamp: '',
      notes: ''
    });

    fetchData();
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Transactions</h2>
          <span className="badge">Live activity stream</span>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-title">
          <h3>Add transaction</h3>
        </div>
        <form onSubmit={handleCreate} className="form-grid">
          <select
            value={form.account_id}
            onChange={(e) => setForm({ ...form, account_id: e.target.value })}
            required
          >
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            placeholder="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
          <input
            placeholder="Merchant"
            value={form.merchant}
            onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
          <input
            type="datetime-local"
            value={form.timestamp}
            onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
          />
          <input
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button className="primary" type="submit">
            Create transaction
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Recent transactions</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.merchant}</td>
                <td>{txn.category}</td>
                <td>{txn.type}</td>
                <td>${Number(txn.amount).toFixed(2)}</td>
                <td>{new Date(txn.timestamp).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;
