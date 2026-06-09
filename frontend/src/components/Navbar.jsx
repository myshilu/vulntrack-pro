import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <header className="navbar">
      <div>
        <strong>Security workspace</strong>
        {user && <span className="navbar-user"> · {user.email}</span>}
      </div>
      {user && (
        <button className="secondary" onClick={logout}>
          Logout
        </button>
      )}
    </header>
  );
};

export default Navbar;
