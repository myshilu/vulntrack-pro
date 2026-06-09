import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside
      style={{
        width: '220px',
        backgroundColor: '#0f172a',
        padding: '1rem',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <h2 style={{ marginBottom: '2rem' }}>VulnTrack Pro</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'active-link' : '')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? 'active-link' : '')}
        >
          All Reports
        </NavLink>
        <NavLink
          to="/reports/create"
          className={({ isActive }) => (isActive ? 'active-link' : '')}
        >
          Create Report
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;