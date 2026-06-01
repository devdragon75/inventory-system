import { useState, useEffect } from 'react';
import { api } from '../api';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await api.get('/summary');
        setSummary(data);
      } catch (err) {
        setError('Failed to load dashboard summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      
      <div className="dashboard-grid">
        <div className="card stat-card">
          <h3>Total Products</h3>
          <p>{summary?.total_products}</p>
        </div>
        <div className="card stat-card">
          <h3>Total Customers</h3>
          <p>{summary?.total_customers}</p>
        </div>
        <div className="card stat-card">
          <h3>Total Orders</h3>
          <p>{summary?.total_orders}</p>
        </div>
        <div className="card stat-card">
          <h3>Low Stock</h3>
          <p style={{color: 'red'}}>{summary?.low_stock_products}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
