import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../services/authContext';

const links = [
  { path: '/overview', label: 'Overview' },
  { path: '/accounts', label: 'Accounts' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/insights', label: 'Insights' }
];

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>VERO</h1>
          <span>Financial Intelligence</span>
        </div>
        <nav className="nav-list">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div>
          <p>{user?.email}</p>
          <button className="secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
