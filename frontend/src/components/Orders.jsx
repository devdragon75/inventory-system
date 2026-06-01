import React, { useState, useCallback } from 'react';
import { api } from '../api';
import { useQuery } from '../hooks/useQuery';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import OrderForm from './OrderForm';
import OrderDetailsModal from './OrderDetailsModal';

const OrderRow = React.memo(({ order, customerName, onDelete, onView }) => (
  <tr>
    <td><strong>#{order.id}</strong></td>
    <td>{customerName}</td>
    <td>₹{Number(order.total_amount).toFixed(2)}</td>
    <td>{new Date(order.created_at).toLocaleDateString()}</td>
    <td style={{ display: 'flex', gap: '5px' }}>
      <button onClick={() => onView(order)} style={{ background: '#0dcaf0', color: 'black', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="View">
        <FiEye />
      </button>
      <button onClick={() => onDelete(order.id)} className="btn-danger" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">
        <FiTrash2 />
      </button>
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

  const [viewingOrder, setViewingOrder] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterTerm, setFilterTerm] = useState('');

  const handleOrderSuccess = (message) => {
    setSuccess(message);
    setActionError(null);
    refetch();
  };

  const handleOrderError = (message) => {
    setActionError(message);
    setSuccess(null);
  };

  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this order? (Inventory will be restored)')) {
      try {
        await api.delete(`/orders/${id}`);
        setSuccess('Order deleted successfully');
        setActionError(null);
        refetch();
      } catch (err) {
        setActionError('Failed to delete order');
        setSuccess(null);
      }
    }
  }, [refetch]);

  if (fetchError) {
    return <div className="alert alert-error">Failed to load orders data: {fetchError.message}</div>;
  }

  const filteredOrders = (orders || []).filter(o => {
    const customerName = customers.find(c => c.id === o.customer_id)?.name || 'Unknown';
    const term = filterTerm.toLowerCase();
    return o.id.toString().includes(term) || customerName.toLowerCase().includes(term);
  });

  return (
    <div>
      <h2>Orders</h2>
      
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <OrderForm 
        customers={customers} 
        products={products} 
        onSuccess={handleOrderSuccess} 
        onError={handleOrderError} 
      />

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Order History</h3>
          <input 
            type="text" 
            placeholder="Filter by Order ID or Customer..." 
            value={filterTerm}
            onChange={e => setFilterTerm(e.target.value)}
            style={{ width: '300px', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>
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
              filteredOrders.map(o => (
                <OrderRow 
                  key={o.id} 
                  order={o} 
                  customerName={customers.find(c => c.id === o.customer_id)?.name || 'Unknown'} 
                  onDelete={handleDelete} 
                  onView={(order) => setViewingOrder(order)}
                />
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailsModal 
        order={viewingOrder}
        customers={customers}
        products={products}
        onClose={() => setViewingOrder(null)}
      />
    </div>
  );
};

export default Orders;
