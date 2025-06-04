import React, { useState, useEffect } from 'react';

function AdminPage() {
  const [form, setForm] = useState({
    name: '',
    image: '',
    price: '',
    description: '',
    detailedDescription: '',
    images: ['', '', ''],
    day1: '',
    day2: '',
    day3: '',
    day4: '',
    day5: ''
  });
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

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

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('http://localhost:5000/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch {
      setMessages([]);
    }
    setLoadingMessages(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('images[')) {
      const idx = parseInt(name.match(/\d+/)[0], 10);
      const newImages = [...form.images];
      newImages[idx] = value;
      setForm({ ...form, images: newImages });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (
      !form.name ||
      !form.image ||
      !form.price ||
      !form.description ||
      !form.detailedDescription ||
      form.images.some(img => !img) ||
      !form.day1 || !form.day2 || !form.day3 || !form.day4 || !form.day5
    ) {
      setError('All fields, 3 images, and 5 days are required');
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
          detailedDescription: form.detailedDescription,
          images: form.images,
          day1: form.day1,
          day2: form.day2,
          day3: form.day3,
          day4: form.day4,
          day5: form.day5
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add package');
        return;
      }
      setSuccess('Package added successfully');
      setForm({
        name: '',
        image: '',
        price: '',
        description: '',
        detailedDescription: '',
        images: ['', '', ''],
        day1: '',
        day2: '',
        day3: '',
        day4: '',
        day5: ''
      });
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

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) fetchMessages();
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24 }}>
      <h2>Admin Package Management</h2>
      <button
        onClick={handleNotificationsClick}
        style={{
          marginBottom: 20,
          padding: '10px 18px',
          background: '#0984e3',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        {showNotifications ? 'Hide Notifications' : 'Show Notifications'}
      </button>
      {showNotifications && (
        <div style={{
          background: '#f9fafc',
          border: '1px solid #eaeaea',
          borderRadius: 10,
          marginBottom: 24,
          padding: 18,
          maxHeight: 340,
          overflowY: 'auto'
        }}>
          <h3 style={{ marginTop: 0 }}>Contact Messages</h3>
          {loadingMessages && <div>Loading...</div>}
          {!loadingMessages && messages.length === 0 && <div>No messages found.</div>}
          {!loadingMessages && messages.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {messages.map(msg => (
                <li key={msg._id} style={{
                  marginBottom: 18,
                  padding: 12,
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <div><strong>Name:</strong> {msg.name}</div>
                  <div><strong>Email:</strong> {msg.email}</div>
                  <div><strong>Subject:</strong> {msg.subject}</div>
                  <div><strong>Message:</strong> {msg.message}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
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
          <label>Image URL (Main)</label>
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
          <label>Additional Image 1</label>
          <input
            type="text"
            name="images[0]"
            value={form.images[0]}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="URL for additional image 1"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Additional Image 2</label>
          <input
            type="text"
            name="images[1]"
            value={form.images[1]}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="URL for additional image 2"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Additional Image 3</label>
          <input
            type="text"
            name="images[2]"
            value={form.images[2]}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="URL for additional image 3"
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
        <div style={{ marginBottom: 12 }}>
          <label>Day 1</label>
          <input
            type="text"
            name="day1"
            value={form.day1}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Itinerary for Day 1"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Day 2</label>
          <input
            type="text"
            name="day2"
            value={form.day2}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Itinerary for Day 2"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Day 3</label>
          <input
            type="text"
            name="day3"
            value={form.day3}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Itinerary for Day 3"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Day 4</label>
          <input
            type="text"
            name="day4"
            value={form.day4}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Itinerary for Day 4"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Day 5</label>
          <input
            type="text"
            name="day5"
            value={form.day5}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Itinerary for Day 5"
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
