import React, { useState, useCallback } from 'react';
import { api } from '../api';
import { useQuery } from '../hooks/useQuery';

const OrderRow = React.memo(({ order, customerName, onDelete }) => (
  <tr>
    <td><strong>#{order.id}</strong></td>
    <td>{customerName}</td>
    <td>₹{Number(order.total_amount).toFixed(2)}</td>
    <td>{new Date(order.created_at).toLocaleDateString()}</td>
    <td>
      <button onClick={() => onDelete(order.id)} className="btn-danger">Delete</button>
    </td>
  </tr>
));

const Orders = () => {
  const fetchAllData = useCallback(async () => {
    const [ordersData, productsData, custData] = await Promise.all([
      api.get('/orders'),
      api.get('/products'),
      api.get('/customers')
    ]);
    return { orders: ordersData, products: productsData, customers: custData };
  }, []);

  const { data, error: fetchError, loading, refetch } = useQuery(fetchAllData);
  const { orders = [], products = [], customers = [] } = data || {};

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  
  const [errors, setErrors] = useState({});
  const [actionError, setActionError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const validate = () => {
    const newErrors = {};
    if (!selectedCustomer) {
      newErrors.customer = 'Please select a customer';
    }
    
    const itemsErrors = {};
    let hasItemErrors = false;
    
    orderItems.forEach((item, index) => {
      itemsErrors[index] = {};
      if (!item.product_id) {
        itemsErrors[index].product_id = 'Please select a product';
        hasItemErrors = true;
      }
      if (isNaN(parseInt(item.quantity)) || parseInt(item.quantity) < 1) {
        itemsErrors[index].quantity = 'Quantity must be at least 1';
        hasItemErrors = true;
      }
    });

    if (hasItemErrors) {
      newErrors.items = itemsErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setActionError(null);
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
      setErrors({});
      refetch();
    } catch (err) {
      setActionError(err.message || 'An error occurred');
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this order? (Inventory will be restored)')) {
      try {
        await api.delete(`/orders/${id}`);
        setSuccess('Order deleted');
        refetch();
      } catch (err) {
        setActionError('Failed to delete order');
      }
    }
  }, [refetch]);

  if (fetchError) {
    return <div className="alert alert-error">Failed to load orders data: {fetchError.message}</div>;
  }

  return (
    <div>
      <h2>Orders</h2>
      
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Create New Order</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Customer</label>
            <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
              <option value="">Select a Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
            {errors.customer && <span style={{color:'red', fontSize:'12px', display:'block', marginTop:'4px'}}>{errors.customer}</span>}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Order Items</label>
            {orderItems.map((item, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select style={{ flex: 1 }}
                    value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)}>
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{Number(p.price).toFixed(2)} ({p.quantity} in stock)</option>
                    ))}
                  </select>
                  <input type="number" placeholder="Qty" style={{ width: '80px' }}
                    value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                  {orderItems.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(index)} className="btn-danger">
                      X
                    </button>
                  )}
                </div>
                {errors.items && errors.items[index] && (
                  <div style={{color:'red', fontSize:'12px', marginTop:'4px'}}>
                    {errors.items[index].product_id && <span>{errors.items[index].product_id} </span>}
                    {errors.items[index].quantity && <span>{errors.items[index].quantity}</span>}
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddItem} style={{ background: 'none', color: '#0056b3', border: 'none', padding: 0, textDecoration: 'underline', marginTop: '10px' }}>
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
              (orders || []).map(o => (
                <OrderRow 
                  key={o.id} 
                  order={o} 
                  customerName={customers.find(c => c.id === o.customer_id)?.name || 'Unknown'} 
                  onDelete={handleDelete} 
                />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
