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
    if (isEdit) {
      // Fetch report data
      const fetchReport = async () => {
        try {
          const res = await api.get(`/reports/${id}`);
          setFormData(res.data);
        } catch (err) {
          setError('Failed to load report');
        }
      };
      fetchReport();
    }
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
        // update
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
    <div className="container" style={{ marginLeft: '220px', paddingTop: '5rem' }}>
      <h2>{isEdit ? 'Edit Report' : 'Create Report'}</h2>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title*</label>
        <input id="title" name="title" value={formData.title} onChange={handleChange} required />

        <label htmlFor="vulnerability_type">Vulnerability Type*</label>
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

        <label htmlFor="severity">Severity*</label>
        <select name="severity" id="severity" value={formData.severity} onChange={handleChange} required>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Informational">Informational</option>
        </select>

        <label htmlFor="status">Status*</label>
        <select name="status" id="status" value={formData.status} onChange={handleChange} required>
          <option value="New">New</option>
          <option value="Triaged">Triaged</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <label htmlFor="affected_url">Affected URL*</label>
        <input id="affected_url" name="affected_url" value={formData.affected_url} onChange={handleChange} required />

        <label htmlFor="endpoint">Endpoint*</label>
        <input id="endpoint" name="endpoint" value={formData.endpoint} onChange={handleChange} required />

        <label htmlFor="http_method">HTTP Method*</label>
        <select name="http_method" id="http_method" value={formData.http_method} onChange={handleChange} required>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>

        <label htmlFor="vulnerable_parameter">Vulnerable Parameter</label>
        <input id="vulnerable_parameter" name="vulnerable_parameter" value={formData.vulnerable_parameter || ''} onChange={handleChange} />

        <label htmlFor="description">Technical Description*</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="3" />

        <label htmlFor="steps_to_reproduce">Steps to Reproduce*</label>
        <textarea id="steps_to_reproduce" name="steps_to_reproduce" value={formData.steps_to_reproduce} onChange={handleChange} required rows="3" />

        <label htmlFor="actual_result">Actual Result*</label>
        <textarea id="actual_result" name="actual_result" value={formData.actual_result} onChange={handleChange} required rows="2" />

        <label htmlFor="expected_result">Expected Result*</label>
        <textarea id="expected_result" name="expected_result" value={formData.expected_result} onChange={handleChange} required rows="2" />

        <label htmlFor="impact">Security Impact*</label>
        <textarea id="impact" name="impact" value={formData.impact} onChange={handleChange} required rows="2" />

        <label htmlFor="remediation">Recommended Remediation*</label>
        <textarea id="remediation" name="remediation" value={formData.remediation} onChange={handleChange} required rows="2" />

        <label htmlFor="raw_request">Raw HTTP Request</label>
        <textarea id="raw_request" name="raw_request" value={formData.raw_request || ''} onChange={handleChange} rows="2" />

        <label htmlFor="raw_response">Raw HTTP Response</label>
        <textarea id="raw_response" name="raw_response" value={formData.raw_response || ''} onChange={handleChange} rows="2" />

        <label htmlFor="notes">Researcher Notes</label>
        <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows="2" />

        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Report' : 'Create Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;