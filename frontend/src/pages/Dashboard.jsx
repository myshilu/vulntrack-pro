import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const statusClass = (status) => `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="container error">{error}</div>;
  if (!stats) return null;

  const severityData = Object.entries(stats.severity_counts).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(stats.status_counts).map(([name, value]) => ({ name, value }));

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Operational view of vulnerability volume, severity, and workflow status.</p>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total reports</span>
          <p className="stat-value">{stats.total_reports}</p>
        </div>
        {severities.map((severity) => (
          <div className="stat-card" key={severity}>
            <span className="stat-label">{severity}</span>
            <p className="stat-value">{stats.severity_counts[severity] || 0}</p>
          </div>
        ))}
      </section>

      <section className="chart-grid">
        <div className="panel chart-panel">
          <h3>Severity Distribution</h3>
          <ResponsiveContainer width="100%" height="82%">
            <BarChart data={severityData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#65716b" />
              <YAxis stroke="#65716b" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dce2dd' }} />
              <Legend />
              <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel chart-panel">
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height="82%">
            <BarChart data={statusData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#65716b" />
              <YAxis stroke="#65716b" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dce2dd' }} />
              <Legend />
              <Bar dataKey="value" fill="#b54708" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel" style={{ marginTop: '18px' }}>
        <h3>Recent Reports</h3>
        <div className="recent-list">
          {stats.recent_reports.length === 0 && <p className="muted">No recent reports.</p>}
          {stats.recent_reports.map((report) => (
            <div key={report.id} className="recent-item">
              <div>
                <strong>{report.title}</strong>
                <div className="report-meta">
                  <span className={`badge ${report.severity}`}>{report.severity}</span>
                  <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
                </div>
              </div>
              <span className="muted">{new Date(report.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
