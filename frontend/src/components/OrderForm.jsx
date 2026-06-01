import React, { useState } from 'react';
import { api } from '../api';
import { FiX } from 'react-icons/fi';

const OrderForm = ({ customers, products, onSuccess, onError }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});

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

    try {
      const payload = {
        customer_id: parseInt(selectedCustomer),
        items: orderItems.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity)
        }))
      };
      await api.post('/orders', payload);
      
      // Reset form
      setSelectedCustomer('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      setErrors({});
      
      if (onSuccess) onSuccess('Order created successfully');
    } catch (err) {
      if (onError) onError(err.message || 'An error occurred');
    }
  };

  return (
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Qty:</span>
                  <input type="number" placeholder="Qty" style={{ width: '80px' }}
                    value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                </label>
                {orderItems.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(index)} className="btn-danger" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove Item">
                    <FiX />
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
  );
};

export default OrderForm;
