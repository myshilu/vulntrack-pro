import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const statusClass = (status) => `status-${status.toLowerCase().replace(/\s+/g, '-')}`;

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === report.status) return;
    setStatusUpdating(true);
    try {
      const res = await api.patch(`/reports/${id}/status`, null, {
        params: { new_status: newStatus },
      });
      setReport(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    setDeleteLoading(true);
    try {
      await api.delete(`/reports/${id}`);
      navigate('/reports');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete report');
    } finally {
      setDeleteLoading(false);
    }
  };

  const generateMarkdown = (rep) => {
    const mdSections = [];
    mdSections.push(`# ${rep.title}\n`);
    mdSections.push(`**Severity:** ${rep.severity}`);
    mdSections.push(`**Status:** ${rep.status}`);
    mdSections.push(`**Vulnerability Type:** ${rep.vulnerability_type}`);
    mdSections.push(`**Affected URL:** ${rep.affected_url}`);
    mdSections.push(`**Endpoint:** ${rep.endpoint}`);
    mdSections.push(`**HTTP Method:** ${rep.http_method}`);
    if (rep.vulnerable_parameter) {
      mdSections.push(`**Vulnerable Parameter:** ${rep.vulnerable_parameter}`);
    }
    mdSections.push(`\n## Description\n${rep.description}`);
    mdSections.push(`\n## Steps to Reproduce\n${rep.steps_to_reproduce}`);
    mdSections.push(`\n## Actual Result\n${rep.actual_result}`);
    mdSections.push(`\n## Expected Result\n${rep.expected_result}`);
    mdSections.push(`\n## Impact\n${rep.impact}`);
    mdSections.push(`\n## Remediation\n${rep.remediation}`);
    if (rep.raw_request) {
      mdSections.push(`\n## Raw HTTP Request\n\n\`\`\``);
      mdSections.push(rep.raw_request);
      mdSections.push(`\n\`\`\``);
    }
    if (rep.raw_response) {
      mdSections.push(`\n## Raw HTTP Response\n\n\`\`\``);
      mdSections.push(rep.raw_response);
      mdSections.push(`\n\`\`\``);
    }
    if (rep.notes) {
      mdSections.push(`\n## Researcher Notes\n${rep.notes}`);
    }
    mdSections.push(`\n**Created:** ${new Date(rep.created_at).toLocaleString()}`);
    mdSections.push(`**Updated:** ${new Date(rep.updated_at).toLocaleString()}`);
    if (rep.status_history && rep.status_history.length > 0) {
      mdSections.push(`\n## Status History`);
      rep.status_history.forEach((h) => {
        mdSections.push(`- **${new Date(h.timestamp).toLocaleString()}**: ${h.previous_status} -> ${h.new_status}`);
      });
    }
    return mdSections.join('\n');
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    navigator.clipboard.writeText(generateMarkdown(report)).then(
      () => alert('Report copied as Markdown'),
      () => alert('Failed to copy report')
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (error) {
    return (
      <div className="container" style={{ marginLeft: '220px', paddingTop: '5rem' }}>
        <p>{error}</p>
      </div>
    );
  }
  if (!report) {
    return null;
  }

  return (
    <div className="container" style={{ marginLeft: '220px', paddingTop: '5rem' }}>
      <h2>Report Details</h2>
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Link to="/reports" className="secondary" style={{ padding: '0.4rem 0.8rem' }}>
          Back to Reports
        </Link>
        <Link to={`/reports/${report.id}/edit`} className="primary" style={{ padding: '0.4rem 0.8rem' }}>
          Edit
        </Link>
        <button onClick={handleDelete} className="danger" style={{ padding: '0.4rem 0.8rem' }} disabled={deleteLoading}>
          {deleteLoading ? 'Deleting...' : 'Delete'}
        </button>
        <button onClick={handleCopyMarkdown} className="secondary" style={{ padding: '0.4rem 0.8rem' }}>
          Copy Markdown
        </button>
        <button onClick={() => window.print()} className="secondary" style={{ padding: '0.4rem 0.8rem' }}>
          Print
        </button>
      </div>

      <div style={{ backgroundColor: '#27304e', padding: '1rem', borderRadius: '6px' }}>
        <h3 style={{ marginTop: 0 }}>{report.title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={`badge ${report.severity}`}>{report.severity}</span>
          <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Created: {new Date(report.created_at).toLocaleString()}</span>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Updated: {new Date(report.updated_at).toLocaleString()}</span>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <strong>Vulnerability Type:</strong> {report.vulnerability_type}
        </div>
        <div><strong>Affected URL:</strong> {report.affected_url}</div>
        <div><strong>Endpoint:</strong> {report.endpoint}</div>
        <div><strong>HTTP Method:</strong> {report.http_method}</div>
        {report.vulnerable_parameter && <div><strong>Vulnerable Parameter:</strong> {report.vulnerable_parameter}</div>}

        <div style={{ marginTop: '1rem' }}>
          <h4>Description</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{report.description}</p>
        </div>
        <div>
          <h4>Steps to Reproduce</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{report.steps_to_reproduce}</p>
        </div>
        <div>
          <h4>Actual Result</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{report.actual_result}</p>
        </div>
        <div>
          <h4>Expected Result</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{report.expected_result}</p>
        </div>
        <div>
          <h4>Security Impact</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{report.impact}</p>
        </div>
        <div>
          <h4>Recommended Remediation</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{report.remediation}</p>
        </div>
        {report.raw_request && (
          <div>
            <h4>Raw HTTP Request</h4>
            <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#1e293b', padding: '0.5rem', borderRadius: '4px' }}>{report.raw_request}</pre>
          </div>
        )}
        {report.raw_response && (
          <div>
            <h4>Raw HTTP Response</h4>
            <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#1e293b', padding: '0.5rem', borderRadius: '4px' }}>{report.raw_response}</pre>
          </div>
        )}
        {report.notes && (
          <div>
            <h4>Researcher Notes</h4>
            <p style={{ whiteSpace: 'pre-line' }}>{report.notes}</p>
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <h4>Update Status</h4>
          <select value={report.status} onChange={handleStatusChange} disabled={statusUpdating}>
            <option value="New">New</option>
            <option value="Triaged">Triaged</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {report.status_history && report.status_history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Status History</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {report.status_history.map((history) => (
              <li key={history.id} style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  {new Date(history.timestamp).toLocaleString()}:
                </span>
                &nbsp;
                <span>{history.previous_status}{' -> '}{history.new_status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportDetails;
