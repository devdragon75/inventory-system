import React from 'react';

const OrderDetailsModal = ({ order, customers, products, onClose }) => {
  if (!order) return null;

  const customerName = customers.find(c => c.id === order.customer_id)?.name || 'Unknown';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '500px', maxWidth: '90%', position: 'relative', margin: 0 }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', color: '#111', border: 'none', fontSize: '24px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>&times;</button>
        <h3 style={{ marginTop: 0, textTransform: 'uppercase' }}>Order #{order.id}</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '5px 0' }}><strong>Customer:</strong> {customerName}</p>
          <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map(item => {
              const p = products.find(prod => prod.id === item.product_id);
              return (
                <tr key={item.id}>
                  <td>{p ? p.name : `Product ID ${item.product_id}`}</td>
                  <td>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{p ? (p.price * item.quantity).toFixed(2) : '-'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan="2" style={{ textAlign: 'right', borderTop: '2px solid #111' }}>Total:</th>
              <th style={{ textAlign: 'right', borderTop: '2px solid #111' }}>₹{Number(order.total_amount).toFixed(2)}</th>
            </tr>
          </tfoot>
        </table>
        
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
