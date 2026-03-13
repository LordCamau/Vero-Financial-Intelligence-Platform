import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface DashboardData {
  total_balance: number;
  monthly_spending: number;
  monthly_income: number;
  top_categories: { category: string; total: number }[];
  recent_transactions: any[];
}

interface HealthData {
  score: number;
  rating: string;
}

const COLORS = ['#0f766e', '#f59e0b', '#b45309', '#0f172a', '#10b981'];

const OverviewPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [dashboardRes, healthRes, transactionsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/insights/health'),
        api.get('/transactions')
      ]);
      setDashboard(dashboardRes.data);
      setHealth(healthRes.data);
      setTransactions(transactionsRes.data || []);
    };

    fetchData();
  }, []);

  const monthlyTrend = useMemo(() => {
    const buckets: Record<string, { month: string; spending: number; income: number; order: number }> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      buckets[key] = {
        month: date.toLocaleString('en-US', { month: 'short' }),
        spending: 0,
        income: 0,
        order: date.getTime()
      };
    }

    transactions.forEach((txn) => {
      const ts = new Date(txn.timestamp);
      const key = `${ts.getFullYear()}-${ts.getMonth()}`;
      if (!buckets[key]) {
        return;
      }
      if (txn.type === 'credit') {
        buckets[key].income += Number(txn.amount);
      } else {
        buckets[key].spending += Number(txn.amount);
      }
    });

    return Object.values(buckets).sort((a, b) => a.order - b.order);
  }, [transactions]);

  const categoryData = dashboard?.top_categories || [];

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Overview</h2>
          <span className="badge">Real-time insights</span>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Total balance</h3>
          <div className="value">${dashboard ? dashboard.total_balance.toFixed(2) : '0.00'}</div>
        </div>
        <div className="card">
          <h3>Monthly spending</h3>
          <div className="value">${dashboard ? dashboard.monthly_spending.toFixed(2) : '0.00'}</div>
        </div>
        <div className="card">
          <h3>Monthly income</h3>
          <div className="value">${dashboard ? dashboard.monthly_income.toFixed(2) : '0.00'}</div>
        </div>
        <div className="card">
          <h3>Health score</h3>
          <div className="value">{health ? `${health.score} (${health.rating})` : '—'}</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>Monthly trends</h3>
            <span className="badge">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#0f766e" strokeWidth={3} />
              <Line type="monotone" dataKey="spending" stroke="#b42318" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="panel-title">
            <h3>Spending breakdown</h3>
            <span className="badge">Categories</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} dataKey="total" nameKey="category" outerRadius={90}>
                {categoryData.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>Category distribution</h3>
            <span className="badge">This month</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="panel-title">
            <h3>Recent transactions</h3>
            <span className="badge">Live feed</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recent_transactions?.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.merchant}</td>
                  <td>{txn.category}</td>
                  <td>${Number(txn.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
