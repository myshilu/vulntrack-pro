import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ReportCard from '../components/ReportCard';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [severity, setSeverity] = useState(searchParams.get('severity') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (search) params.search = search;
        if (severity) params.severity = severity;
        if (statusFilter) params.status = statusFilter;
        if (sort) params.sort = sort;
        setSearchParams(params);
        const res = await api.get('/reports', { params });
        setReports(res.data);
      } catch {
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [search, severity, statusFilter, sort, setSearchParams]);

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Search, triage, and maintain vulnerability findings.</p>
        </div>
        <Link to="/reports/create" className="primary">
          New Report
        </Link>
      </div>

      <section className="panel">
        <div className="toolbar">
          <input type="text" placeholder="Search reports" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Informational">Informational</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="New">New</option>
            <option value="Triaged">Triaged</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="severity">Severity</option>
          </select>
          <button
            className="secondary"
            onClick={() => {
              setSearch('');
              setSeverity('');
              setStatusFilter('');
              setSort('newest');
            }}
          >
            Clear
          </button>
        </div>
        {loading && <div className="loading">Loading reports...</div>}
        {error && <p className="error">{error}</p>}
        {!loading && reports.length === 0 && <p className="muted">No reports found.</p>}
        <div className="report-list">
          {!loading && reports.map((report) => <ReportCard key={report.id} report={report} />)}
        </div>
      </section>
    </main>
  );
};

export default Reports;
