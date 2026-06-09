import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ReportCard from '../components/ReportCard';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Form state tied to search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [severity, setSeverity] = useState(searchParams.get('severity') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (severity) params.severity = severity;
      if (statusFilter) params.status = statusFilter;
      if (sort) params.sort = sort;
      const res = await api.get('/reports', { params });
      setReports(res.data);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // update search params in URL
    const params = {};
    if (search) params.search = search;
    if (severity) params.severity = severity;
    if (statusFilter) params.status = statusFilter;
    if (sort) params.sort = sort;
    setSearchParams(params);
    fetchReports();
  }, [search, severity, statusFilter, sort]);

  return (
    <div className="container" style={{ marginLeft: '220px', paddingTop: '5rem' }}>
      <h2>All Reports</h2>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/reports/create" className="primary" style={{ padding: '0.5rem 0.8rem', display: 'inline-block' }}>
          + New Report
        </Link>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 200px' }}
        />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ flex: '1 1 150px' }}>
          <option value="">Severity</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Informational">Informational</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: '1 1 150px' }}>
          <option value="">Status</option>
          <option value="New">New</option>
          <option value="Triaged">Triaged</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ flex: '1 1 150px' }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="severity">Severity</option>
        </select>
        <button className="secondary" onClick={() => {
          setSearch('');
          setSeverity('');
          setStatusFilter('');
          setSort('newest');
        }}>Clear Filters</button>
      </div>
      {loading && <div className="loading">Loading...</div>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {!loading && reports.length === 0 && <p>No reports found.</p>}
      {!loading && reports.map((report) => <ReportCard key={report.id} report={report} />)}
    </div>
  );
};

export default Reports;