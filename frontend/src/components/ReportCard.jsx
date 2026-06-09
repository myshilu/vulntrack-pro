import React from 'react';
import { Link } from 'react-router-dom';

const statusClass = (status) => `status-${status.toLowerCase().replace(/\s+/g, '-')}`;

const ReportCard = ({ report }) => {
  return (
    <article className="report-card">
      <div className="report-card-header">
        <h3>{report.title}</h3>
        <span className={`badge ${report.severity}`}>{report.severity}</span>
      </div>
      <div className="report-meta">
        <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
        <span className="muted">{new Date(report.created_at).toLocaleString()}</span>
        <span className="muted">{report.vulnerability_type}</span>
      </div>
      <p>{report.description.substring(0, 150)}...</p>
      <div className="actions">
        <Link to={`/reports/${report.id}`} className="primary">
          View
        </Link>
        <Link to={`/reports/${report.id}/edit`} className="secondary">
          Edit
        </Link>
      </div>
    </article>
  );
};

export default ReportCard;
