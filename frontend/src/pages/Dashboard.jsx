import React, { useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
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

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (error) {
    return <div className="container" style={{ marginLeft: '220px', paddingTop: '5rem' }}>{error}</div>;
  }
  if (!stats) {
    return null;
  }
  // Prepare data for charts
  const severityData = Object.entries(stats.severity_counts).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(stats.status_counts).map(([name, value]) => ({ name, value }));

  return (
    <div className="container" style={{ marginLeft: '220px', paddingTop: '5rem' }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 200px', backgroundColor: '#27304e', padding: '1rem', borderRadius: '6px' }}>
          <h3>Total Reports</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{stats.total_reports}</p>
        </div>
        {['Critical', 'High', 'Medium', 'Low', 'Informational'].map((sev) => (
          <div key={sev} style={{ flex: '1 1 150px', backgroundColor: '#27304e', padding: '1rem', borderRadius: '6px' }}>
            <h4>{sev}</h4>
            <p style={{ fontSize: '1.5rem', margin: 0 }}>{stats.severity_counts[sev] || 0}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: '1 1 300px', minWidth: '300px', height: '300px', backgroundColor: '#27304e', padding: '1rem', borderRadius: '6px' }}>
          <h3>Severity Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={severityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#f5f5f5" />
              <YAxis stroke="#f5f5f5" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} cursor={{ fill: '#334155' }} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: '1 1 300px', minWidth: '300px', height: '300px', backgroundColor: '#27304e', padding: '1rem', borderRadius: '6px' }}>
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={statusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#f5f5f5" />
              <YAxis stroke="#f5f5f5" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} cursor={{ fill: '#334155' }} />
              <Legend />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h3>Recent Reports</h3>
        {stats.recent_reports.length === 0 && <p>No recent reports.</p>}
        {stats.recent_reports.map((report) => (
          <div key={report.id} style={{ backgroundColor: '#27304e', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0 }}>{report.title}</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge ${report.severity}`}>{report.severity}</span>
              <span className={`badge ${statusClass(report.status)}`}>{report.status}</span>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(report.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
