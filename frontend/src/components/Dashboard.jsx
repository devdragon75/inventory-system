import { useState, useEffect } from 'react';
import { api } from '../api';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6f42c1', '#0dcaf0', '#ffc107', '#20c997', '#fd7e14'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryData, productsData, ordersData, customersData] = await Promise.all([
          api.get('/summary'),
          api.get('/products?limit=1000'),
          api.get('/orders?limit=1000'),
          api.get('/customers?limit=1000')
        ]);
        setSummary(summaryData);
        setProducts(productsData);
        setOrders(ordersData);
        setCustomers(customersData);
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

  const inventoryValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const lowStockProducts = products.filter(p => p.quantity < 10).slice(0, 5);
  
  // Top Selling Products (for PieChart)
  const productSales = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
    });
  });
  const topSellingProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => {
      const p = products.find(p => p.id === parseInt(id));
      return { name: p ? p.name : `Product #${id}`, value: qty };
    });

  // Customer Report (Customers with most orders, for BarChart)
  const customerOrderCount = {};
  orders.forEach(o => {
    customerOrderCount[o.customer_id] = (customerOrderCount[o.customer_id] || 0) + 1;
  });
  const topCustomers = Object.entries(customerOrderCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const c = customers.find(c => c.id === parseInt(id));
      // Using first name for cleaner chart labels
      return { name: c ? c.name.split(' ')[0] : `ID ${id}`, orders: count };
    });

  // Recent Orders (last 5 orders)
  const recentOrders = [...orders].reverse().slice(0, 5);

  return (
    <div>
      <h2 style={{textTransform: 'uppercase', borderBottom: '4px solid #111', paddingBottom: '10px', marginBottom: '30px'}}>
        System Overview
      </h2>
      
      <div className="dashboard-grid">
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #8960db 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>Total Products</h3>
          <p>{summary?.total_products}</p>
        </div>
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #0dcaf0 0%, #4ddbf4 100%)', color: '#111', border: 'none' }}>
          <h3 style={{ color: '#111', borderBottom: '1px solid rgba(0,0,0,0.2)' }}>Total Orders</h3>
          <p>{summary?.total_orders}</p>
        </div>
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #20c997 0%, #4ddbb3 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>Total Customers</h3>
          <p>{summary?.total_customers}</p>
        </div>
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, #fd7e14 0%, #fdb074 100%)', color: 'white', border: 'none' }}>
          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>Inventory Value</h3>
          <p>₹{inventoryValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', marginTop: '20px' }}>
        
        {/* Low Stock Table */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{marginTop: 0, textTransform: 'uppercase', marginBottom: '20px'}}>Low Stock Products</h3>
          {lowStockProducts.length === 0 ? <p>No low stock products.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td style={{color: 'red', fontWeight: 'bold'}}>{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Orders Table */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{marginTop: 0, textTransform: 'uppercase', marginBottom: '20px'}}>Recent Orders</h3>
          {recentOrders.length === 0 ? <p>No orders yet.</p> : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{customers.find(c => c.id === o.customer_id)?.name || 'Unknown'}</td>
                    <td>₹{Number(o.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Selling Products - Donut Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{marginTop: 0, textTransform: 'uppercase', marginBottom: '20px'}}>Top Selling Products</h3>
          {topSellingProducts.length === 0 ? <p>No sales yet.</p> : (
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={topSellingProducts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#111" label>
                    {topSellingProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{fontFamily: 'Space Mono', borderRadius: 0, border: '2px solid #111'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Customer Report - Bar Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{marginTop: 0, textTransform: 'uppercase', marginBottom: '20px'}}>Customer Report</h3>
          {topCustomers.length === 0 ? <p>No customers with orders yet.</p> : (
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={topCustomers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="name" tick={{fontFamily: 'Space Mono', fontSize: 12}} />
                  <YAxis tick={{fontFamily: 'Space Mono', fontSize: 12}} />
                  <RechartsTooltip contentStyle={{fontFamily: 'Space Mono', borderRadius: 0, border: '2px solid #111'}} />
                  <Bar dataKey="orders" fill="#6f42c1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
