import React from 'react';
import { Link } from 'react-router-dom';

const statusClass = (status) => `status-${status.toLowerCase().replace(/\s+/g, '-')}`;

const ReportCard = ({ report }) => {
  return (
    <div
      style={{
        backgroundColor: '#27304e',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{report.title}</h3>
        <span className={`badge ${report.severity}`}>{report.severity}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
        <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{new Date(report.created_at).toLocaleString()}</span>
      </div>
      <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{report.description.substring(0, 120)}...</p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link to={`/reports/${report.id}`} className="primary" style={{ textDecoration: 'none', padding: '0.4rem 0.8rem' }}>
          View
        </Link>
        <Link to={`/reports/${report.id}/edit`} className="secondary" style={{ textDecoration: 'none', padding: '0.4rem 0.8rem' }}>
          Edit
        </Link>
      </div>
    </div>
  );
};

export default ReportCard;
