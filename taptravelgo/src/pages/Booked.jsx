import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Booked() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [boarding, setBoarding] = useState('');
  const [bill, setBill] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [bookingTime, setBookingTime] = useState('');
  const [user, setUser] = useState({ name: '', email: '' });
  const [paymentDone, setPaymentDone] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    fetch(`/api/packages/${id}`)
      .then(res => res.json())
      .then(data => setPkg(data));
    // Try to get user info from localStorage/sessionStorage if available
    let storedUser = {};
    try {
      storedUser =
        (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))) ||
        (sessionStorage.getItem('user') && JSON.parse(sessionStorage.getItem('user'))) ||
        {};
    } catch {
      storedUser = {};
    }
    setUser({ name: storedUser.name || '', email: storedUser.email || '' });
  }, [id]);

  useEffect(() => {
    if (pkg && passengers > 0) {
      setBill(pkg.price * passengers);
    }
  }, [pkg, passengers]);

  // Helper to get next N Saturdays
  function getNextSaturdays(n = 8) {
    const saturdays = [];
    let date = new Date();
    // Set to next Saturday
    date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7));
    for (let i = 0; i < n; i++) {
      saturdays.push(new Date(date));
      date.setDate(date.getDate() + 7);
    }
    return saturdays;
  }

  const availableSaturdays = getNextSaturdays(8);

  const handleSubmit = async e => {
    e.preventDefault();
    setBookingTime(new Date().toLocaleString());
    setDateError('');
    if (!selectedDate) {
      setDateError('Please select a start date (Saturday).');
      return;
    }
    // Ensure passengers and bill are numbers, and all fields are present
    const bookingData = {
      email: user.email?.trim(),
      name: user.name?.trim(),
      destination: pkg.name?.trim(),
      passengers: Number(passengers),
      boarding: boarding.trim(),
      bill: Number(bill),
      startDate: selectedDate
    };
    // Check for missing fields before sending
    if (
      !bookingData.email ||
      !bookingData.name ||
      !bookingData.destination ||
      !bookingData.boarding ||
      isNaN(bookingData.passengers) ||
      bookingData.passengers < 1 ||
      isNaN(bookingData.bill) ||
      bookingData.bill < 1 ||
      !bookingData.startDate
    ) {
      alert(
        'All fields are required and you must be logged in.\n' +
        'Please log in before booking. If you are logged in and still see this, your browser may be blocking storage.\n' +
        'Try a different browser, disable tracking prevention, or allow third-party cookies for this site.'
      );
      return;
    }
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Booking failed.');
        return;
      }
      setShowSummary(true);
    } catch {
      alert('Server error. Please try again.');
    }
  };

  const handlePayment = async () => {
    // Navigate to dummy UPI payment page and update status to paid if bookingId is available
    // After booking, fetch the latest booking for this user/package to get the bookingId
    try {
      const res = await fetch(`/api/mytrips?email=${encodeURIComponent(user.email)}`);
      const trips = await res.json();
      // Find the latest booking for this package and user (by createdAt)
      const latest = trips
        .filter(trip => trip.destination === pkg.name && trip.bill === bill && trip.status !== 'paid')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (latest && latest._id) {
        // Mark as paid immediately
        await fetch('/api/booking/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: latest._id })
        });
        navigate(`/upi-payment?amount=${bill}&bookingId=${latest._id}`);
      } else {
        // fallback: just go to payment page
        navigate(`/upi-payment?amount=${bill}`);
      }
    } catch {
      navigate(`/upi-payment?amount=${bill}`);
    }
  };

  if (!pkg) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #eaf6fb 60%, #f9fafc 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: 540,
        width: '100%',
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 28,
        boxShadow: '0 12px 40px rgba(44,62,80,0.18)',
        margin: '2.5rem auto',
        minHeight: 650,
        perspective: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          minHeight: 650,
          transition: 'transform 0.7s cubic-bezier(.4,2,.6,1)',
          transformStyle: 'preserve-3d',
          position: 'relative',
          transform: showSummary ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* Front Side (Booking Form) */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              width: '100%',
              top: 0,
              left: 0,
              zIndex: showSummary ? 1 : 2,
              background: '#f9fafc',
              borderRadius: 28,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              boxShadow: '0 4px 24px rgba(44,62,80,0.10)',
              padding: '0 0 32px 0',
              minHeight: 650
            }}
            className="card-front"
          >
            <h2 style={{
              textAlign: 'center',
              marginTop: '2rem',
              marginBottom: '1.2rem',
              color: '#222f3e',
              fontWeight: 700,
              letterSpacing: 1,
              fontFamily: 'serif',
              fontSize: '2.1rem'
            }}>{pkg.name}</h2>
            <img
              src={
                pkg.image &&
                !pkg.image.includes('i.pinimg.com/originals/d8/9e/3d/d89e3d0cc3a4f986b496b1844e1bbac8.jpg')')
            ? pkg.image
            : 'https://via.placeholder.com/400x200?text=Image+Unavailable'
              }
            alt={pkg.name}
            style={{
              width: '92%',
              borderRadius: 20,
              margin: '0 auto 1.2rem auto',
              maxHeight: 220,
              objectFit: 'cover',
              boxShadow: '0 2px 16px rgba(0,0,0,0.11)',
              display: 'block'
            }}
            onError={e => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x200?text=Image+Unavailable';
            }}
            />
            <form onSubmit={handleSubmit} style={{ width: '92%', margin: '0 auto', marginTop: 10 }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0984e3', display: 'block', marginBottom: 6 }}>Number of Passengers</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={passengers}
                  onChange={e => setPassengers(Number(e.target.value))}
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 10,
                    border: '1.5px solid #b2bec3',
                    fontSize: 18,
                    background: '#fff'
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0984e3', display: 'block', marginBottom: 6 }}>Boarding Point</label>
                <input
                  type="text"
                  value={boarding}
                  onChange={e => setBoarding(e.target.value)}
                  required
                  placeholder="Enter boarding location"
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 10,
                    border: '1.5px solid #b2bec3',
                    fontSize: 18,
                    background: '#fff'
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, color: '#0984e3', display: 'block', marginBottom: 6 }}>Select Start Date (Only Saturdays Available)</label>
                <select
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 10,
                    border: '1.5px solid #b2bec3',
                    fontSize: 18,
                    background: '#fff'
                  }}
                >
                  <option value="">-- Select a Saturday --</option>
                  {availableSaturdays.map(date => (
                    <option key={date.toISOString().slice(0, 10)} value={date.toISOString().slice(0, 10)}>}>
                      {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>
                {dateError && <div style={{ color: 'red', marginTop: 6 }}>{dateError}</div>}
              </div>
              <div style={{
                margin: '28px 0 18px 0',
                background: '#f1f2f6',
                borderRadius: 12,
                padding: '20px 26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 20,
                fontWeight: 600,
                boxShadow: '0 1px 6px rgba(44,62,80,0.08)'
              }}>
                <span style={{ color: '#222f3e' }}>Final Bill:</span>
                <span style={{ color: '#27ae60', fontWeight: 700, fontSize: 26 }}>
                  ₹{bill}
                </span>
              </div>
              {/* Confirm Booking button always visible on the form */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '18px 0',
                  background: 'linear-gradient(90deg, #27ae60 60%, #00b894 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 10,
                  marginBottom: 10,
                  boxShadow: '0 2px 12px rgba(39, 174, 96, 0.10)',
                  transition: 'background 0.2s, opacity 0.2s'
                }}
              >
                Confirm Booking
              </button>
            </form>
          </div>
          {/* Back Side (Booking Summary & Payment) */}
          <div style={{
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            transform: 'rotateY(180deg)',
            zIndex: showSummary ? 2 : 1,
            background: '#f9fafc',
            borderRadius: 28,
            minHeight: 650,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            boxShadow: '0 4px 24px rgba(44,62,80,0.10)',
            padding: '0 0 32px 0'
          }}>
            <div style={{ padding: 36, width: '94%' }}>
              <h2 style={{
                textAlign: 'center',
                color: '#27ae60',
                fontWeight: 700,
                marginBottom: 18,
                fontSize: '2rem'
              }}>Booking Confirmed!</h2>
              <div style={{
                background: '#fff',
                borderRadius: 14,
                boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                padding: 28,
                marginBottom: 18,
                fontSize: 18
              }}>
                <div style={{ marginBottom: 10 }}><strong>Package:</strong> {pkg.name}</div>
                <div style={{ marginBottom: 10 }}><strong>Passengers:</strong> {passengers}</div>
                <div style={{ marginBottom: 10 }}><strong>Boarding Point:</strong> {boarding}</div>
                <div style={{ marginBottom: 10 }}><strong>Start Date:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : ''}</div>
                <div style={{ marginBottom: 10 }}><strong>Total Bill:</strong> ₹{bill}</div>
                <div style={{ marginBottom: 0, color: '#636e72', fontSize: 15 }}>
                  <strong>Booking Time:</strong> {bookingTime}
                </div>
              </div>
              {!paymentDone ? (
                <button
                  onClick={handlePayment}
                  style={{
                    width: '100%',
                    padding: '18px 0',
                    background: 'linear-gradient(90deg, #0984e3 60%, #00b894 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 22,
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: 10,
                    marginBottom: 10,
                    boxShadow: '0 2px 12px rgba(39, 174, 96, 0.10)',
                    transition: 'background 0.2s, opacity 0.2s'
                  }}
                >
                  Pay ₹{bill}
                </button>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#27ae60',
                  fontWeight: 600,
                  fontSize: 20,
                  marginTop: 10,
                  marginBottom: 10
                }}>
                  Payment Successful!<br />
                  Thank you for booking with TapTravelGo!<br />
                  Your boarding time will be notified soon through your mail.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booked;
