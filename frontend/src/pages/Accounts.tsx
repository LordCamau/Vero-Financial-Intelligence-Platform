import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Account {
  id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
  created_at: string;
}

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({
    account_name: '',
    account_type: 'Checking',
    balance: '0',
    currency: 'USD'
  });

  const fetchAccounts = async () => {
    const response = await api.get('/accounts');
    setAccounts(response.data || []);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post('/accounts', {
      account_name: form.account_name,
      account_type: form.account_type,
      balance: Number(form.balance),
      currency: form.currency
    });
    setForm({ account_name: '', account_type: 'Checking', balance: '0', currency: 'USD' });
    fetchAccounts();
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Accounts</h2>
          <span className="badge">Connected portfolios</span>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-title">
          <h3>Create account</h3>
        </div>
        <form onSubmit={handleCreate} className="form-grid">
          <input
            placeholder="Account name"
            value={form.account_name}
            onChange={(e) => setForm({ ...form, account_name: e.target.value })}
            required
          />
          <select
            value={form.account_type}
            onChange={(e) => setForm({ ...form, account_type: e.target.value })}
          >
            <option value="Checking">Checking</option>
            <option value="Savings">Savings</option>
            <option value="Credit">Credit</option>
            <option value="Investment">Investment</option>
          </select>
          <input
            type="number"
            placeholder="Balance"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
          />
          <input
            placeholder="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
          <button className="primary" type="submit">
            Add account
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Account list</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.account_name}</td>
                <td>{account.account_type}</td>
                <td>${Number(account.balance).toFixed(2)}</td>
                <td>{account.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsPage;
