import { useState, useEffect } from 'react';
import { api } from '../api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = async () => {
    try {
      const [ordersData, productsData, custData] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
        api.get('/customers')
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(custData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        customer_id: parseInt(selectedCustomer),
        items: orderItems.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity)
        }))
      };
      await api.post('/orders', payload);
      setSuccess('Order created successfully');
      setSelectedCustomer('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      fetchData();
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this order? (Inventory will be restored)')) {
      try {
        await api.delete(`/orders/${id}`);
        setSuccess('Order deleted');
        fetchData();
      } catch (err) {
        setError('Failed to delete order');
      }
    }
  };

  return (
    <div>
      <h2>Orders</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Create New Order</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Customer</label>
            <select required value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
              <option value="">Select a Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Order Items</label>
            {orderItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select required style={{ flex: 1 }}
                  value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)}>
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${Number(p.price).toFixed(2)} ({p.quantity} in stock)</option>
                  ))}
                </select>
                <input type="number" placeholder="Qty" required min="1" style={{ width: '80px' }}
                  value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                {orderItems.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(index)} className="btn-danger">
                    X
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddItem} style={{ background: 'none', color: '#0056b3', border: 'none', padding: 0, textDecoration: 'underline' }}>
              + Add another product
            </button>
          </div>

          <button type="submit" style={{ background: '#6f42c1' }}>
            Create Order
          </button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5">Loading...</td></tr> :
              orders.map(o => (
              <tr key={o.id}>
                <td><strong>#{o.id}</strong></td>
                <td>{customers.find(c => c.id === o.customer_id)?.name || 'Unknown'}</td>
                <td>${Number(o.total_amount).toFixed(2)}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(o.id)} className="btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
