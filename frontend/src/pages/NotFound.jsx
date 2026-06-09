import React from 'react';
import { Link } from 'react-router-dom';

/*
 * NotFound
 *
 * Displays a simple 404 page for undefined routes. Provides a link back
 * to the dashboard to help users recover from navigation errors.
 */
const NotFound = () => (
  <div className="container" style={{ marginLeft: '220px', paddingTop: '5rem' }}>
    <h2>404 - Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
    <Link to="/dashboard" className="primary" style={{ padding: '0.4rem 0.8rem' }}>
      Go to Dashboard
    </Link>
  </div>
);

export default NotFound;