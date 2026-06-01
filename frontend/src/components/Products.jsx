import React, { useState, useCallback } from 'react';
import { api } from '../api';
import { useQuery } from '../hooks/useQuery';

const ProductRow = React.memo(({ product, onEdit, onDelete }) => (
  <tr>
    <td>{product.name}</td>
    <td>{product.sku}</td>
    <td>₹{Number(product.price).toFixed(2)}</td>
    <td>{product.quantity}</td>
    <td>
      <button onClick={() => onEdit(product)} style={{ background: '#ffc107', color: 'black', marginRight: '5px' }}>Edit</button>
      <button onClick={() => onDelete(product.id)} className="btn-danger">Delete</button>
    </td>
  </tr>
));

const Products = () => {
  const fetchProducts = useCallback(() => api.get('/products'), []);
  const { data: products = [], error: fetchError, loading, refetch } = useQuery(fetchProducts);
  
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [actionError, setActionError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
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
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        setSuccess('Product updated successfully');
      } else {
        await api.post('/products', formData);
        setSuccess('Product added successfully');
      }
      setFormData({ name: '', sku: '', price: '', quantity: '' });
      setEditingId(null);
      setErrors({});
      refetch();
    } catch (err) {
      setActionError(err.message || 'An error occurred');
    }
  };

  const handleEdit = useCallback((product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity
    });
    setEditingId(product.id);
    setErrors({});
    setActionError(null);
    setSuccess(null);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setSuccess('Product deleted');
        refetch();
      } catch (err) {
        setActionError('Failed to delete product');
      }
    }
  }, [refetch]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setFormData({ name: '', sku: '', price: '', quantity: '' });
    setErrors({});
    setActionError(null);
    setSuccess(null);
  }, []);

  if (fetchError) {
    return <div className="alert alert-error">Failed to load products: {fetchError.message}</div>;
  }

  const filteredProducts = (products || []).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Products</h2>
      
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="text" placeholder="Name"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            {errors.name && <span style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.name}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="text" placeholder="SKU"
              value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            {errors.sku && <span style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.sku}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="number" step="0.01" placeholder="Price"
              value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            {errors.price && <span style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.price}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="number" placeholder="Quantity"
              value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            {errors.quantity && <span style={{color:'red', fontSize:'12px', marginTop:'4px'}}>{errors.quantity}</span>}
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={{ background: '#6c757d', marginLeft: '10px' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Product List</h3>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '250px', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>
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
              filteredProducts.map(p => (
                <ProductRow 
                  key={p.id} 
                  product={p} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
