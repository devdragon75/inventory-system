import { useState, useEffect } from 'react';
import api from '../api';
import { Trash2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
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
      setError(err.response?.data?.detail || 'An error occurred');
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded">{success}</div>}

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Full Name" className="border p-2 rounded" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="email" placeholder="Email" className="border p-2 rounded" required
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="tel" placeholder="Phone" className="border p-2 rounded" required
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <div className="md:col-span-3">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Add Customer
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-800 text-sm">
            {loading ? <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr> :
              customers.map(c => (
              <tr key={c.id}>
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4">{c.email}</td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4 flex justify-end">
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
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
