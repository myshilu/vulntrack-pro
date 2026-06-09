import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const initialState = {
  title: '',
  vulnerability_type: '',
  severity: 'Medium',
  status: 'New',
  affected_url: '',
  endpoint: '',
  http_method: 'GET',
  vulnerable_parameter: '',
  description: '',
  steps_to_reproduce: '',
  actual_result: '',
  expected_result: '',
  impact: '',
  remediation: '',
  raw_request: '',
  raw_response: '',
  notes: '',
};

const ReportForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        setFormData(res.data);
      } catch {
        setError('Failed to load report');
      }
    };
    fetchReport();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/reports/${id}`, formData);
      } else {
        await api.post('/reports', formData);
      }
      navigate('/reports');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Report' : 'Create Report'}</h1>
          <p className="page-subtitle">Capture the technical evidence, impact, and remediation path.</p>
        </div>
      </div>

      <section className="panel">
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="full" htmlFor="title">
              Title*
              <input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </label>

            <label htmlFor="vulnerability_type">
              Vulnerability Type*
              <select name="vulnerability_type" id="vulnerability_type" value={formData.vulnerability_type} onChange={handleChange} required>
                <option value="">Select...</option>
                <option value="Broken Access Control">Broken Access Control</option>
                <option value="IDOR">IDOR</option>
                <option value="SQL Injection">SQL Injection</option>
                <option value="Cross-Site Scripting">Cross-Site Scripting</option>
                <option value="CSRF">CSRF</option>
                <option value="SSRF">SSRF</option>
                <option value="Authentication Failure">Authentication Failure</option>
                <option value="Security Misconfiguration">Security Misconfiguration</option>
                <option value="Sensitive Data Exposure">Sensitive Data Exposure</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label htmlFor="severity">
              Severity*
              <select name="severity" id="severity" value={formData.severity} onChange={handleChange} required>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Informational">Informational</option>
              </select>
            </label>

            <label htmlFor="status">
              Status*
              <select name="status" id="status" value={formData.status} onChange={handleChange} required>
                <option value="New">New</option>
                <option value="Triaged">Triaged</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </label>

            <label htmlFor="http_method">
              HTTP Method*
              <select name="http_method" id="http_method" value={formData.http_method} onChange={handleChange} required>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </label>

            <label htmlFor="affected_url">
              Affected URL*
              <input id="affected_url" name="affected_url" value={formData.affected_url} onChange={handleChange} required />
            </label>

            <label htmlFor="endpoint">
              Endpoint*
              <input id="endpoint" name="endpoint" value={formData.endpoint} onChange={handleChange} required />
            </label>

            <label htmlFor="vulnerable_parameter">
              Vulnerable Parameter
              <input id="vulnerable_parameter" name="vulnerable_parameter" value={formData.vulnerable_parameter || ''} onChange={handleChange} />
            </label>

            <label className="full" htmlFor="description">
              Technical Description*
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="4" />
            </label>

            <label className="full" htmlFor="steps_to_reproduce">
              Steps to Reproduce*
              <textarea id="steps_to_reproduce" name="steps_to_reproduce" value={formData.steps_to_reproduce} onChange={handleChange} required rows="4" />
            </label>

            <label htmlFor="actual_result">
              Actual Result*
              <textarea id="actual_result" name="actual_result" value={formData.actual_result} onChange={handleChange} required rows="3" />
            </label>

            <label htmlFor="expected_result">
              Expected Result*
              <textarea id="expected_result" name="expected_result" value={formData.expected_result} onChange={handleChange} required rows="3" />
            </label>

            <label htmlFor="impact">
              Security Impact*
              <textarea id="impact" name="impact" value={formData.impact} onChange={handleChange} required rows="3" />
            </label>

            <label htmlFor="remediation">
              Recommended Remediation*
              <textarea id="remediation" name="remediation" value={formData.remediation} onChange={handleChange} required rows="3" />
            </label>

            <label htmlFor="raw_request">
              Raw HTTP Request
              <textarea id="raw_request" name="raw_request" value={formData.raw_request || ''} onChange={handleChange} rows="3" />
            </label>

            <label htmlFor="raw_response">
              Raw HTTP Response
              <textarea id="raw_response" name="raw_response" value={formData.raw_response || ''} onChange={handleChange} rows="3" />
            </label>

            <label className="full" htmlFor="notes">
              Researcher Notes
              <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows="3" />
            </label>
          </div>

          <div className="actions">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Report' : 'Create Report'}
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/reports')}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default ReportForm;
