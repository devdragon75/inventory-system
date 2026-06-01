import { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, Edit } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        setSuccess('Product updated successfully');
      } else {
        await api.post('/products', formData);
        setSuccess('Product added successfully');
      }
      setFormData({ name: '', sku: '', price: '', quantity: '' });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setSuccess('Product deleted');
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Products</h1>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded">{success}</div>}

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Name" className="border p-2 rounded" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="SKU" className="border p-2 rounded" required
            value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          <input type="number" step="0.01" placeholder="Price" className="border p-2 rounded" required min="0.01"
            value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          <input type="number" placeholder="Quantity" className="border p-2 rounded" required min="0"
            value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          <div className="md:col-span-2 flex space-x-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', sku:'', price:'', quantity:''})}} 
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-800 text-sm">
            {loading ? <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr> :
              products.map(p => (
              <tr key={p.id}>
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.sku}</td>
                <td className="p-4">${p.price.toFixed(2)}</td>
                <td className="p-4">{p.quantity}</td>
                <td className="p-4 flex justify-end space-x-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
