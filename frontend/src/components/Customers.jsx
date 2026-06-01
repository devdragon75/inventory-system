import React, { useState, useCallback } from 'react';
import { api } from '../api';
import { useQuery } from '../hooks/useQuery';

const CustomerRow = React.memo(({ customer, onDelete }) => (
  <tr>
    <td>{customer.name}</td>
    <td>{customer.email}</td>
    <td>{customer.phone}</td>
    <td>
      <button onClick={() => onDelete(customer.id)} className="btn-danger">Delete</button>
    </td>
  </tr>
));

const Customers = () => {
  const fetchCustomers = useCallback(() => api.get('/customers'), []);
  const { data: customers = [], error: fetchError, loading, refetch } = useQuery(fetchCustomers);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [actionError, setActionError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone format is invalid';
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
      await api.post('/customers', formData);
      setSuccess('Customer added successfully');
      setFormData({ name: '', email: '', phone: '' });
      setErrors({});
      refetch();
    } catch (err) {
      setActionError(err.message || 'An error occurred');
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        setSuccess('Customer deleted');
        refetch();
      } catch (err) {
        setActionError('Failed to delete customer');
      }
    }
  }, [refetch]);

  if (fetchError) {
    return <div className="alert alert-error">Failed to load customers: {fetchError.message}</div>;
  }

  const filteredCustomers = (customers || []).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div>
      <h2>Customers</h2>
      
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Add New Customer</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="text" placeholder="Full Name"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            {errors.name && <span style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.name}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="email" placeholder="Email"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            {errors.email && <span style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.email}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="tel" placeholder="Phone"
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            {errors.phone && <span style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.phone}</span>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ background: '#28a745' }}>
              Add Customer
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Customer List</h3>
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '250px', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4">Loading...</td></tr> :
              filteredCustomers.map(c => (
                <CustomerRow key={c.id} customer={c} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
