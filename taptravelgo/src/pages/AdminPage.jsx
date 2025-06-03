import React, { useState, useEffect } from 'react';

function AdminPage() {
  const [form, setForm] = useState({
    name: '',
    image: '',
    price: '',
    description: '',
    detailedDescription: ''
  });
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/packages');
      const data = await res.json();
      setPackages(data);
    } catch {
      setError('Failed to fetch packages');
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.image || !form.price || !form.description || !form.detailedDescription) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          image: form.image,
          price: Number(form.price),
          description: form.description,
          detailedDescription: form.detailedDescription
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add package');
        return;
      }
      setSuccess('Package added successfully');
      setForm({ name: '', image: '', price: '', description: '', detailedDescription: '' });
      fetchPackages();
    } catch {
      setError('Server error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/packages/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        setError('Failed to delete package');
        return;
      }
      setSuccess('Package deleted');
      fetchPackages();
    } catch {
      setError('Server error');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24 }}>
      <h2>Admin Package Management</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Place Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Image URL</label>
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Detailed Description</label>
          <textarea
            name="detailedDescription"
            value={form.detailedDescription}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
        <button type="submit" style={{ width: '100%', padding: 10 }}>Add Package</button>
      </form>

      <h3>Existing Packages</h3>
      <div>
        {packages.length === 0 && <div>No packages found.</div>}
        {packages.map(pkg => (
          <div key={pkg._id} style={{ border: '1px solid #ddd', borderRadius: 8, marginBottom: 16, padding: 12, display: 'flex', alignItems: 'center' }}>
            <img src={pkg.img || pkg.image} alt={pkg.name} style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16, borderRadius: 4 }} />
            <div style={{ flex: 1 }}>
              <div><strong>{pkg.name}</strong></div>
              <div>{pkg.desc || pkg.description}</div>
              <div style={{ color: '#555' }}>{pkg.rate || `₹${pkg.price}`}</div>
            </div>
            <button onClick={() => handleDelete(pkg._id)} style={{ marginLeft: 16, background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
