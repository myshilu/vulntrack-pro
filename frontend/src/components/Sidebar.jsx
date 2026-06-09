import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-title">VulnTrack Pro</span>
        <span className="brand-subtitle">Vulnerability management</span>
      </div>
      <nav className="side-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `side-link ${isActive ? 'active-link' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `side-link ${isActive ? 'active-link' : ''}`}>
          Reports
        </NavLink>
        <NavLink to="/reports/create" className={({ isActive }) => `side-link ${isActive ? 'active-link' : ''}`}>
          New Report
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
