import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
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
  const [showBooked, setShowBooked] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [bookingEditId, setBookingEditId] = useState(null);
  const [bookingEditForm, setBookingEditForm] = useState({
    name: '',
    email: '',
    passengers: 1,
    boarding: '',
    bill: 0,
    startDate: '',
    status: 'not paid'
  });
  const [activeTab, setActiveTab] = useState(''); // '', 'notifications', 'booked', 'add', 'edit'

  // Add admin message state for cancellation
  const [adminMessage, setAdminMessage] = useState('');
  const [showMessageBoxId, setShowMessageBoxId] = useState(null);

  const navigate = useNavigate();

  // Fetch packages and bookings on mount
  useEffect(() => {
    fetchPackages();
    if (showBooked) {
      fetchBookings();
    }
  }, [showBooked]);

  // Show Notifications tab: load messages when tab is activated
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchMessages();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackages(data);
    } catch {
      setError('Failed to fetch packages');
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/all-bookings');
      const data = await res.json();
      setBookings(data);
    } catch {
      setBookings([]);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/messages');
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
      const res = await fetch('/api/packages', {
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
      const res = await fetch(`/api/packages/${id}`, {
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

  const handleEditClick = async pkg => {
    try {
      const res = await fetch(`/api/packages/${pkg._id}`);
      const data = await res.json();
      setEditId(pkg._id);
      setEditForm({
        name: data.name || '',
        image: data.image || '',
        price: data.price !== undefined && data.price !== null ? String(data.price) : '',
        description: data.description || '',
        detailedDescription: data.detailedDescription || '',
        images: Array.isArray(data.images)
          ? [
            data.images[0] || '',
            data.images[1] || '',
            data.images[2] || ''
          ]
          : ['', '', ''],
        day1: data.day1 || '',
        day2: data.day2 || '',
        day3: data.day3 || '',
        day4: data.day4 || '',
        day5: data.day5 || ''
      });
      setError('');
      setSuccess('');
    } catch {
      setError('Failed to load package details for editing');
    }
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('images[')) {
      const idx = parseInt(name.match(/\d+/)[0], 10);
      const newImages = [...editForm.images];
      newImages[idx] = value;
      setEditForm({ ...editForm, images: newImages });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    // Only send fields that have a value, but always send all fields to backend for consistency
    // However, allow empty fields to keep their previous value
    const updatedFields = {};
    Object.keys(editForm).forEach(key => {
      // If the field is not empty, use the new value; else, use the old value from the package
      if (
        editForm[key] !== '' &&
        !(Array.isArray(editForm[key]) && editForm[key].every(img => img === ''))
      ) {
        updatedFields[key] = editForm[key];
      } else {
        // Find the original package and use its value
        const pkg = packages.find(p => p._id === editId);
        if (pkg) {
          if (key === 'images') {
            updatedFields[key] = Array.isArray(pkg.images) && pkg.images.length === 3
              ? [...pkg.images]
              : ['', '', ''];
          } else {
            updatedFields[key] = pkg[key] ?? '';
          }
        }
      }
    });

    try {
      const res = await fetch(`/api/packages/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedFields,
          price: Number(updatedFields.price)
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update package');
        return;
      }
      setSuccess('Package updated successfully');
      setEditId(null);
      fetchPackages();
    } catch {
      setError('Server error');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm({
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
  };

  // Handle edit form changes for bookings
  const handleBookingEditChange = e => {
    const { name, value } = e.target;
    setBookingEditForm({ ...bookingEditForm, [name]: value });
  };

  // Start editing a booking
  const handleBookingEdit = booking => {
    setBookingEditId(booking._id);
    setBookingEditForm({
      name: booking.name,
      email: booking.email,
      passengers: booking.passengers,
      boarding: booking.boarding,
      bill: booking.bill,
      startDate: booking.startDate,
      status: booking.status || 'not paid'
    });
  };

  // Save booking edit
  const handleBookingEditSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/booking/${bookingEditId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingEditForm)
      });
      if (!res.ok) {
        alert('Failed to update booking');
        return;
      }
      setBookingEditId(null);
      fetchBookings();
    } catch {
      alert('Server error');
    }
  };

  // Remove customer and send cancel message to canceltext collection
  const handleBookingDelete = async (bookingId, email) => {
    setShowMessageBoxId(bookingId);
  };

  const confirmRemoveCustomer = async (bookingId, email) => {
    if (!window.confirm('Are you sure you want to remove this customer?')) return;
    try {
      // Find the booking to get destination and startDate
      const booking = bookings.find(b => b._id === bookingId);
      // Send cancel message to canceltext collection with trip name and start date
      if (adminMessage && email && booking) {
        await fetch('/api/canceltext', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            message: adminMessage,
            destination: booking.destination || '',
            startDate: booking.startDate || ''
          })
        });
      }
      // Remove booking
      const res = await fetch(`/api/booking/${bookingId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        alert('Failed to delete booking');
        return;
      }
      setShowMessageBoxId(null);
      setAdminMessage('');
      fetchBookings();
    } catch {
      alert('Server error');
    }
  };

  // Unique destinations for buttons
  const destinations = Array.from(new Set(bookings.map(b => b.destination)));

  // Filtered bookings for selected destination, sorted by startDate
  const filteredBookings = bookings
    .filter(b => b.destination === selectedDestination)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  // Only show edit form if a package is selected for editing
  const showEditForm = activeTab === 'edit' && editId;

  // Button style for all 4 buttons
  const tabBtnStyle = isActive => ({
    padding: '10px 18px',
    background: isActive ? '#0984e3' : '#b2bec3',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    cursor: 'pointer',
    flex: 1,
    minWidth: 120,
    transition: 'background 0.2s'
  });

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, position: 'relative' }}>
      {/* Logout button */}
      <button
        onClick={() => navigate('/adminlogin')}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: '8px 18px',
          background: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        Logout
      </button>

      <h2>Admin Package Management</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('notifications')}
          style={tabBtnStyle(activeTab === 'notifications')}
        >
          Show Notifications
        </button>
        <button
          onClick={() => {
            setActiveTab('booked');
            if (!showBooked) setShowBooked(true);
          }}
          style={tabBtnStyle(activeTab === 'booked')}
        >
          Booked Customers
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={tabBtnStyle(activeTab === 'add')}
        >
          Add Package
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          style={tabBtnStyle(activeTab === 'edit')}
        >
          Edit Package
        </button>
      </div>

      {/* Show Notifications */}
      {activeTab === 'notifications' && (
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
          <button onClick={fetchMessages} style={{ marginBottom: 10, background: '#0984e3', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Refresh</button>
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

      {/* Booked Customers */}
      {activeTab === 'booked' && (
        <div style={{
          background: '#f9fafc',
          border: '1px solid #eaeaea',
          borderRadius: 10,
          marginBottom: 24,
          padding: 18
        }}>
          <h3 style={{ marginTop: 0 }}>Booked Customers</h3>
          <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {destinations.map(dest => (
              <button
                key={dest}
                onClick={() => setSelectedDestination(dest)}
                style={{
                  background: selectedDestination === dest ? '#0984e3' : '#b2bec3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 18px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {dest}
              </button>
            ))}
          </div>
          {selectedDestination && (
            <div>
              <h4>Bookings for <span style={{ color: '#0984e3' }}>{selectedDestination}</span></h4>
              {filteredBookings.length === 0 && <div>No bookings found for this destination.</div>}
              {filteredBookings.map(booking =>
                bookingEditId === booking._id ? (
                  <form key={booking._id} onSubmit={handleBookingEditSubmit} style={{ border: '1px solid #0984e3', borderRadius: 8, marginBottom: 16, padding: 12, background: '#f1f8ff' }}>
                    <div style={{ marginBottom: 8 }}>
                      <label>Name</label>
                      <input type="text" name="name" value={bookingEditForm.name} onChange={handleBookingEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Email</label>
                      <input type="email" name="email" value={bookingEditForm.email} onChange={handleBookingEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Passengers</label>
                      <input type="number" name="passengers" value={bookingEditForm.passengers} onChange={handleBookingEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Boarding</label>
                      <input type="text" name="boarding" value={bookingEditForm.boarding} onChange={handleBookingEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Bill</label>
                      <input type="number" name="bill" value={bookingEditForm.bill} onChange={handleBookingEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Start Date</label>
                      <input type="date" name="startDate" value={bookingEditForm.startDate} onChange={handleBookingEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Status</label>
                      <select name="status" value={bookingEditForm.status} onChange={handleBookingEditChange} style={{ width: '100%', padding: 6, marginTop: 2 }}>
                        <option value="not paid">Not Paid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <button type="submit" style={{ marginRight: 8, background: '#27ae60', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}>Save</button>
                    <button type="button" onClick={() => setBookingEditId(null)} style={{ background: '#636e72', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}>Cancel</button>
                  </form>
                ) : (
                  <div key={booking._id} style={{ border: '1px solid #ddd', borderRadius: 8, marginBottom: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div><strong>Name:</strong> {booking.name}</div>
                      <div><strong>Email:</strong> {booking.email}</div>
                      <div><strong>Passengers:</strong> {booking.passengers}</div>
                      <div><strong>Boarding:</strong> {booking.boarding}</div>
                      <div><strong>Bill:</strong> ₹{booking.bill}</div>
                      <div><strong>Start Date:</strong> {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : ''}</div>
                      <div><strong>Status:</strong> <span style={{ color: booking.status === 'paid' ? '#27ae60' : '#e17055' }}>{booking.status}</span></div>
                    </div>
                    <button onClick={() => handleBookingEdit(booking)} style={{ background: '#0984e3', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleBookingDelete(booking._id, booking.email)}
                      style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Remove Customer
                    </button>
                    {showMessageBoxId === booking._id && (
                      <div style={{ marginTop: 10, width: '100%' }}>
                        <textarea
                          placeholder="Message to customer (optional)"
                          value={adminMessage}
                          onChange={e => setAdminMessage(e.target.value)}
                          style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid #b2bec3', marginBottom: 8, padding: 6 }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            onClick={() => confirmRemoveCustomer(booking._id, booking.email)}
                            style={{
                              background: '#27ae60',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              padding: '6px 16px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Confirm Remove
                          </button>
                          <button
                            onClick={() => { setShowMessageBoxId(null); setAdminMessage(''); }}
                            style={{
                              background: '#636e72',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              padding: '6px 16px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )
              }
            </div >
          )
          }
        </div >
      )}

      {/* Add Package */}
      {
        activeTab === 'add' && (
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
        )
      }

      {/* Edit Package */}
      {
        activeTab === 'edit' && (
          <div>
            <h3>Existing Packages</h3>
            <div>
              {packages.length === 0 && <div>No packages found.</div>}
              {packages.map(pkg =>
                editId === pkg._id ? (
                  <form key={pkg._id} onSubmit={handleEditSubmit} style={{ border: '1px solid #0984e3', borderRadius: 8, marginBottom: 16, padding: 12, background: '#f1f8ff' }}>
                    <div style={{ marginBottom: 8 }}>
                      <label>Place Name</label>
                      <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Image URL (Main)</label>
                      <input type="text" name="image" value={editForm.image} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Additional Image 1</label>
                      <input type="text" name="images[0]" value={editForm.images[0]} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Additional Image 2</label>
                      <input type="text" name="images[1]" value={editForm.images[1]} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Additional Image 3</label>
                      <input type="text" name="images[2]" value={editForm.images[2]} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Price</label>
                      <input type="number" name="price" value={editForm.price} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Description</label>
                      <textarea name="description" value={editForm.description} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Detailed Description</label>
                      <textarea name="detailedDescription" value={editForm.detailedDescription} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div >
                    <div style={{ marginBottom: 8 }}>
                      <label>Day 1</label>
                      <input type="text" name="day1" value={editForm.day1} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Day 2</label>
                      <input type="text" name="day2" value={editForm.day2} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Day 3</label>
                      <input type="text" name="day3" value={editForm.day3} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Day 4</label>
                      <input type="text" name="day4" value={editForm.day4} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label>Day 5</label>
                      <input type="text" name="day5" value={editForm.day5} onChange={handleEditChange} required style={{ width: '100%', padding: 6, marginTop: 2 }} />
                    </div>
                    <button type="submit" style={{ marginRight: 8, background: '#27ae60', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}>Save</button>
                    <button type="button" onClick={handleCancelEdit} style={{ background: '#636e72', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}>Cancel</button>
                  </form>
                ) : (
                  <div key={pkg._id} style={{ border: '1px solid #ddd', borderRadius: 8, marginBottom: 16, padding: 12, display: 'flex', alignItems: 'center' }}>
                    <img src={pkg.img || pkg.image} alt={pkg.name} style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16, borderRadius: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div><strong>{pkg.name}</strong></div>
                      <div>{pkg.desc || pkg.description}</div>
                      <div style={{ color: '#555' }}>{pkg.rate || `₹${pkg.price}`}</div>
                    </div>
                    <button onClick={() => handleEditClick(pkg)} style={{ marginLeft: 8, background: '#0984e3', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(pkg._id)} style={{ marginLeft: 8, background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}

export default AdminPage;
