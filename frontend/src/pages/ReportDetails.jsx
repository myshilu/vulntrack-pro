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
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
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
    if (rep.vulnerable_parameter) mdSections.push(`**Vulnerable Parameter:** ${rep.vulnerable_parameter}`);
    mdSections.push(`\n## Description\n${rep.description}`);
    mdSections.push(`\n## Steps to Reproduce\n${rep.steps_to_reproduce}`);
    mdSections.push(`\n## Actual Result\n${rep.actual_result}`);
    mdSections.push(`\n## Expected Result\n${rep.expected_result}`);
    mdSections.push(`\n## Impact\n${rep.impact}`);
    mdSections.push(`\n## Remediation\n${rep.remediation}`);
    if (rep.raw_request) mdSections.push(`\n## Raw HTTP Request\n\n\`\`\`\n${rep.raw_request}\n\`\`\``);
    if (rep.raw_response) mdSections.push(`\n## Raw HTTP Response\n\n\`\`\`\n${rep.raw_response}\n\`\`\``);
    if (rep.notes) mdSections.push(`\n## Researcher Notes\n${rep.notes}`);
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

  if (loading) return <div className="loading">Loading report...</div>;
  if (error) return <main className="container error">{error}</main>;
  if (!report) return null;

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{report.title}</h1>
          <div className="report-meta">
            <span className={`badge ${report.severity}`}>{report.severity}</span>
            <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
            <span className="muted">Updated {new Date(report.updated_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="actions">
          <Link to="/reports" className="secondary">Back</Link>
          <Link to={`/reports/${report.id}/edit`} className="primary">Edit</Link>
        </div>
      </div>

      <div className="detail-shell">
        <section className="panel">
          <div className="actions" style={{ marginBottom: '16px' }}>
            <button onClick={handleDelete} className="danger" disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
            <button onClick={handleCopyMarkdown} className="secondary">Copy Markdown</button>
            <button onClick={() => window.print()} className="secondary">Print</button>
          </div>

          <div className="detail-grid">
            <div className="field-line"><strong>Type:</strong> {report.vulnerability_type}</div>
            <div className="field-line"><strong>Method:</strong> {report.http_method}</div>
            <div className="field-line"><strong>URL:</strong> {report.affected_url}</div>
            <div className="field-line"><strong>Endpoint:</strong> {report.endpoint}</div>
            {report.vulnerable_parameter && <div className="field-line"><strong>Parameter:</strong> {report.vulnerable_parameter}</div>}
          </div>

          <div className="content-block">
            <h3>Description</h3>
            <p>{report.description}</p>
          </div>
          <div className="content-block">
            <h3>Steps to Reproduce</h3>
            <p>{report.steps_to_reproduce}</p>
          </div>
          <div className="content-block">
            <h3>Actual Result</h3>
            <p>{report.actual_result}</p>
          </div>
          <div className="content-block">
            <h3>Expected Result</h3>
            <p>{report.expected_result}</p>
          </div>
          <div className="content-block">
            <h3>Impact</h3>
            <p>{report.impact}</p>
          </div>
          <div className="content-block">
            <h3>Remediation</h3>
            <p>{report.remediation}</p>
          </div>
          {report.raw_request && (
            <div className="content-block">
              <h3>Raw HTTP Request</h3>
              <pre className="code-block">{report.raw_request}</pre>
            </div>
          )}
          {report.raw_response && (
            <div className="content-block">
              <h3>Raw HTTP Response</h3>
              <pre className="code-block">{report.raw_response}</pre>
            </div>
          )}
          {report.notes && (
            <div className="content-block">
              <h3>Researcher Notes</h3>
              <p>{report.notes}</p>
            </div>
          )}
        </section>

        <section className="panel">
          <h3>Workflow</h3>
          <label htmlFor="status">
            Update Status
            <select id="status" value={report.status} onChange={handleStatusChange} disabled={statusUpdating}>
              <option value="New">New</option>
              <option value="Triaged">Triaged</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </label>
          {report.status_history && report.status_history.length > 0 && (
            <div style={{ marginTop: '18px' }}>
              <h3>Status History</h3>
              <div className="recent-list">
                {report.status_history.map((history) => (
                  <div key={history.id} className="recent-item">
                    <span>{history.previous_status} {'->'} {history.new_status}</span>
                    <span className="muted">{new Date(history.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ReportDetails;
