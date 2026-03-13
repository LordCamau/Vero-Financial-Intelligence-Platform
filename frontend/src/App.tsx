import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/Login';
import OverviewPage from './pages/Overview';
import AccountsPage from './pages/Accounts';
import TransactionsPage from './pages/Transactions';
import InsightsPage from './pages/Insights';

const ProtectedRoutes: React.FC = () => {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }
  return <DashboardLayout />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
