import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="container">
    <section className="panel">
      <h1 className="page-title">Page Not Found</h1>
      <p className="page-subtitle">The route you opened is not available in this workspace.</p>
      <div className="actions" style={{ marginTop: '18px' }}>
        <Link to="/dashboard" className="primary">
          Go to Dashboard
        </Link>
      </div>
    </section>
  </main>
);

export default NotFound;
