import { useState, useEffect } from 'react';
import { api } from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchProducts = async () => {
    try {
      const data = await api.get('/products');
      setProducts(data);
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
      setError(err.message || 'An error occurred');
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
    <div>
      <h2>Products</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input type="text" placeholder="Name" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="SKU" required
            value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          <input type="number" step="0.01" placeholder="Price" required min="0.01"
            value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          <input type="number" placeholder="Quantity" required min="0"
            value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', sku:'', price:'', quantity:''})}} 
                style={{ background: '#6c757d', marginLeft: '10px' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5">Loading...</td></tr> :
              products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <button onClick={() => handleEdit(p)} style={{ background: '#ffc107', color: 'black', marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="btn-danger">Delete</button>
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
