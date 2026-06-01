import { useState, useEffect } from 'react';
import { api } from '../api';

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
  
  // Top Selling Products
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
      return { name: p ? p.name : `Product #${id}`, sold: qty };
    });

  // Customer Report (Customers with most orders)
  const customerOrderCount = {};
  orders.forEach(o => {
    customerOrderCount[o.customer_id] = (customerOrderCount[o.customer_id] || 0) + 1;
  });
  const topCustomers = Object.entries(customerOrderCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const c = customers.find(c => c.id === parseInt(id));
      return { name: c ? c.name : `Customer #${id}`, orders: count };
    });

  return (
    <div>
      <h2 style={{textTransform: 'uppercase', borderBottom: '4px solid #111', paddingBottom: '10px', marginBottom: '30px'}}>
        System Overview
      </h2>
      
      <div className="dashboard-grid">
        <div className="card stat-card">
          <h3>Total Products</h3>
          <p>{summary?.total_products}</p>
        </div>
        <div className="card stat-card">
          <h3>Total Orders</h3>
          <p>{summary?.total_orders}</p>
        </div>
        <div className="card stat-card">
          <h3>Total Customers</h3>
          <p>{summary?.total_customers}</p>
        </div>
        <div className="card stat-card">
          <h3>Inventory Value</h3>
          <p>₹{inventoryValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '20px' }}>
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

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{marginTop: 0, textTransform: 'uppercase', marginBottom: '20px'}}>Top Selling Products</h3>
          {topSellingProducts.length === 0 ? <p>No sales yet.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{marginTop: 0, textTransform: 'uppercase', marginBottom: '20px'}}>Customer Report (Top Buyers)</h3>
          {topCustomers.length === 0 ? <p>No customers with orders yet.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={i}>
                    <td>{c.name}</td>
                    <td>{c.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
