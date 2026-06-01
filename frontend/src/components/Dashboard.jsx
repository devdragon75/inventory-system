import { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryData, productsData, ordersData] = await Promise.all([
          api.get('/summary'),
          api.get('/products?limit=10'),
          api.get('/orders?limit=30')
        ]);
        setSummary(summaryData);
        setProducts(productsData);
        setOrders(ordersData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div style={{padding: '40px', fontWeight: 'bold'}}>LOADING SYS_DATA...</div>;
  if (error) return <div className="alert alert-error">ERR: {error}</div>;

  // Process data for charts
  const inventoryChartData = products.map(p => ({
    name: p.sku,
    quantity: p.quantity,
    value: p.price * p.quantity
  }));

  const orderTrendData = orders.map(o => {
    const date = new Date(o.created_at);
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      amount: o.total_amount
    };
  }).reverse(); // chronological

  return (
    <div>
      <h2 style={{textTransform: 'uppercase', borderBottom: '4px solid #111', paddingBottom: '10px', marginBottom: '30px'}}>
        System Overview
      </h2>
      
      <div className="dashboard-grid">
        <div className="card stat-card">
          <h3>Total Assets</h3>
          <p>{summary?.total_products}</p>
        </div>
        <div className="card stat-card">
          <h3>Client Base</h3>
          <p>{summary?.total_customers}</p>
        </div>
        <div className="card stat-card">
          <h3>Fulfilled Orders</h3>
          <p>{summary?.total_orders}</p>
        </div>
        <div className="card stat-card" style={summary?.low_stock_products > 0 ? {backgroundColor: 'var(--accent)', color: '#fff'} : {}}>
          <h3 style={summary?.low_stock_products > 0 ? {color: '#fff', borderBottomColor: '#fff'} : {}}>Critical Stock</h3>
          <p>{summary?.low_stock_products}</p>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3 style={{marginTop: 0, textTransform: 'uppercase', marginBottom: '20px'}}>Inventory Levels (Top 10)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={inventoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" tick={{fontFamily: 'Space Mono', fontSize: 12}} />
                <YAxis tick={{fontFamily: 'Space Mono', fontSize: 12}} />
                <Tooltip contentStyle={{fontFamily: 'Space Mono', borderRadius: 0, border: '2px solid #111'}} />
                <Bar dataKey="quantity" fill="#111" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginTop: 0, textTransform: 'uppercase', marginBottom: '20px'}}>Revenue Timeline</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={orderTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="date" tick={{fontFamily: 'Space Mono', fontSize: 12}} />
                <YAxis tick={{fontFamily: 'Space Mono', fontSize: 12}} />
                <Tooltip contentStyle={{fontFamily: 'Space Mono', borderRadius: 0, border: '2px solid #111'}} />
                <Legend wrapperStyle={{fontFamily: 'Space Mono'}}/>
                <Line type="monotone" dataKey="amount" stroke="#FF3300" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
