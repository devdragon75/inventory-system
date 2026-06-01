import { useState, useEffect } from 'react';
import api from '../api';
import { Trash2 } from 'lucide-react';

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
      const [ordersRes, productsRes, custRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
        api.get('/customers')
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCustomers(custRes.data);
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
      setError(err.response?.data?.detail || 'An error occurred');
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded">{success}</div>}

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create New Order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select className="border p-2 rounded w-full" required
              value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
              <option value="">Select a Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Items</label>
            {orderItems.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <select className="border p-2 rounded flex-1" required
                  value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)}>
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price} ({p.quantity} in stock)</option>
                  ))}
                </select>
                <input type="number" className="border p-2 rounded w-24" placeholder="Qty" required min="1"
                  value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                {orderItems.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:bg-red-50 px-2 rounded">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="text-blue-600 text-sm hover:underline font-medium">
              + Add another product
            </button>
          </div>

          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Create Order
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-800 text-sm">
            {loading ? <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr> :
              orders.map(o => (
              <tr key={o.id}>
                <td className="p-4 font-medium">#{o.id}</td>
                <td className="p-4">{customers.find(c => c.id === o.customer_id)?.name || 'Unknown'}</td>
                <td className="p-4">${o.total_amount.toFixed(2)}</td>
                <td className="p-4">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-4 flex justify-end">
                  <button onClick={() => handleDelete(o.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
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
