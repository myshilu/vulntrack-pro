import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <header
      style={{
        backgroundColor: '#0f172a',
        color: '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        position: 'fixed',
        top: 0,
        left: '220px',
        right: 0,
        zIndex: 1000,
      }}
    >
      <div>
        {user ? <strong>Logged in as {user.email}</strong> : <strong>VulnTrack Pro</strong>}
      </div>
      {user && (
        <button className="secondary" onClick={logout} style={{ fontSize: '0.9rem' }}>
          Logout
        </button>
      )}
    </header>
  );
};

export default Navbar;