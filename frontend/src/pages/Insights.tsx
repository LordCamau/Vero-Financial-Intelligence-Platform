import React, { useEffect, useState } from 'react';
import api from '../services/api';

const InsightsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [subsRes, anomaliesRes, cashflowRes] = await Promise.all([
        api.get('/insights/subscriptions'),
        api.get('/insights/anomalies'),
        api.get('/insights/cashflow')
      ]);
      setSubscriptions(subsRes.data || []);
      setAnomalies(anomaliesRes.data || []);
      setCashflow(cashflowRes.data || null);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Insights</h2>
          <span className="badge">AI-powered intelligence</span>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Predicted income</h3>
          <div className="value">${cashflow?.predicted_income?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="card">
          <h3>Predicted expenses</h3>
          <div className="value">${cashflow?.predicted_expenses?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="card">
          <h3>Predicted balance</h3>
          <div className="value">${cashflow?.predicted_balance?.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="panel">
          <div className="panel-title">
            <h3>Subscriptions</h3>
            <span className="badge">Recurring charges</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Next charge</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, index) => (
                <tr key={`${sub.merchant}-${index}`}>
                  <td>{sub.merchant}</td>
                  <td>${Number(sub.amount).toFixed(2)}</td>
                  <td>{sub.frequency}</td>
                  <td>{new Date(sub.next_expected_charge).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="panel-title">
            <h3>Anomalies</h3>
            <span className="badge">Requires attention</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((anomaly, index) => (
                <tr key={`${anomaly.merchant}-${index}`}>
                  <td>{anomaly.merchant}</td>
                  <td>${Number(anomaly.amount).toFixed(2)}</td>
                  <td>{anomaly.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
