import { useState, useEffect } from 'react';
import { api } from '../api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCustomers = async () => {
    try {
      const data = await api.get('/customers');
      setCustomers(data);
    } catch (err) {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post('/customers', formData);
      setSuccess('Customer added successfully');
      setFormData({ name: '', email: '', phone: '' });
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        setSuccess('Customer deleted');
        fetchCustomers();
      } catch (err) {
        setError('Failed to delete customer');
      }
    }
  };

  return (
    <div>
      <h2>Customers</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Add New Customer</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input type="text" placeholder="Full Name" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="email" placeholder="Email" required
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="tel" placeholder="Phone" required
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ background: '#28a745' }}>
              Add Customer
            </button>
          </div>
        </form>
      </div>

      <div className="card">
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
              customers.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>
                  <button onClick={() => handleDelete(c.id)} className="btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
