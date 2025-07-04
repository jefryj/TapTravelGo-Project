import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Mytrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTexts, setCancelTexts] = useState([]);
  const [removedTrips, setRemovedTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let user = {};
    try {
      user =
        (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))) ||
        (sessionStorage.getItem('user') && JSON.parse(sessionStorage.getItem('user'))) ||
        {};
    } catch {
      user = {};
    }
    if (!user.email) {
      setTrips([]);
      setLoading(false);
      return;
    }
    fetch(`http://localhost:5000/api/mytrips?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        setTrips(data);
        setLoading(false);
      })
      .catch(() => {
        setTrips([]);
        setLoading(false);
      });

    // Fetch cancel texts for this user
    fetch(`http://localhost:5000/api/canceltext?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => setCancelTexts(data))
      .catch(() => setCancelTexts([]));
  }, []);

  // After cancelTexts are loaded, show removed trips as "rejected"
  useEffect(() => {
    if (cancelTexts.length === 0) {
      setRemovedTrips([]);
      return;
    }
    // For each cancelText, create a "fake" trip card if not present in trips
    setRemovedTrips(cancelTexts.map(cancel => ({
      _id: `rejected-${cancel._id || Math.random()}`,
      destination: cancel.destination || cancel.packageName || 'Trip',
      passengers: '',
      boarding: '',
      bill: '',
      startDate: cancel.startDate || '',
      createdAt: cancel.createdAt,
      status: 'rejected',
      email: cancel.email,
      cancelMsg: cancel.message
    })));
  }, [cancelTexts, trips]);

  const handleContinuePayment = (trip) => {
    navigate(`/upi-payment?amount=${trip.bill}&bookingId=${trip._id}`);
  };

  // Helper to get cancel message for a trip (if any)
  const getCancelMessage = trip => {
    if (trip.status === 'rejected') {
      // If trip is a removed trip, use its cancelMsg, else find from cancelTexts
      return trip.cancelMsg ||
        (cancelTexts.find(
          c => c.email === trip.email && (!c.destination || c.destination === trip.destination)
        )?.message || '');
    }
    return null;
  };

  useEffect(() => {
    // Add a class to body to disable the top SVG wave for this page
    document.body.classList.add('mytrips-page');
    return () => {
      document.body.classList.remove('mytrips-page');
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #eaf6fb 60%, #f9fafc 100%)',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <button
        onClick={() => navigate('/home')}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: 'linear-gradient(90deg, #0984e3 60%, #00b894 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          padding: '10px 22px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(39, 174, 96, 0.08)',
          zIndex: 10
        }}
      >
        ← Home
      </button>
      <div style={{
        width: '100%',
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 12px 32px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {loading && <div style={{
          color: '#636e72',
          fontSize: '1.2rem',
          marginTop: '2rem'
        }}>Loading...</div>}
        {!loading && trips.length === 0 && removedTrips.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '1.15rem',
            marginTop: '2rem',
            background: '#fff',
            borderRadius: 14,
            padding: '32px 0',
            boxShadow: '0 2px 12px rgba(44,62,80,0.08)'
          }}>No trips found.</div>
        )}
        {!loading && (trips.length > 0 || removedTrips.length > 0) && (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            width: '100%',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '28px'
          }}>
            {/* Show normal trips */}
            {trips.map((trip, idx) => {
              const cancelMsg = getCancelMessage(trip);
              const isRejected = trip.status === 'rejected' && (cancelMsg !== null);
              return (
                <li
                  key={trip._id || idx}
                  style={{
                    background: 'linear-gradient(100deg, #f9fafc 70%, #eaf6fb 100%)',
                    border: isRejected
                      ? '2.5px solid #e74c3c'
                      : '1.5px solid #e0e0e0',
                    borderRadius: 16,
                    boxShadow: '0 4px 18px rgba(44,62,80,0.10)',
                    padding: '28px 32px',
                    margin: 0,
                    width: '100%',
                    maxWidth: 600,
                    transition: 'box-shadow 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#222f3e', marginBottom: 6 }}>
                    {trip.destination}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginBottom: 8 }}>
                    <span style={{ color: '#0984e3', fontWeight: 600 }}>Passengers: <span style={{ color: '#353b48', fontWeight: 500 }}>{trip.passengers}</span></span>
                    <span style={{ color: '#0984e3', fontWeight: 600 }}>Boarding: <span style={{ color: '#353b48', fontWeight: 500 }}>{trip.boarding}</span></span>
                    <span style={{ color: '#0984e3', fontWeight: 600 }}>Total Bill: <span style={{ color: '#27ae60', fontWeight: 700 }}>₹{trip.bill}</span></span>
                  </div>
                  <div style={{ color: '#636e72', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                    <span>
                      <strong>Start Date:</strong>{' '}
                      {trip.startDate
                        ? new Date(trip.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
                        : 'N/A'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: '#636e72',
                    marginTop: 2,
                    fontStyle: 'italic'
                  }}>
                    Booked At: {trip.createdAt ? new Date(trip.createdAt).toLocaleString() : ''}
                  </div>
                  <div style={{
                    marginTop: 10,
                    fontWeight: 600,
                    color: isRejected
                      ? '#e74c3c'
                      : (trip.status === 'paid' ? '#27ae60' : '#e17055'),
                    fontSize: 16
                  }}>
                    Status: {isRejected
                      ? 'Rejected'
                      : (trip.status === 'paid' ? 'Paid' : 'Not Paid')}
                  </div>
                  {/* Show cancel message if present */}
                  {isRejected && cancelMsg && (
                    <div style={{
                      marginTop: 12,
                      background: '#fffbe6',
                      border: '1.5px solid #f1c40f',
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: '#b9770e',
                      fontWeight: 600,
                      fontSize: 15
                    }}>
                      <span>Message from Admin: </span>
                      <span>{cancelMsg}</span>
                    </div>
                  )}
                  {trip.status === 'not paid' && !isRejected && (
                    <button
                      onClick={() => handleContinuePayment(trip)}
                      style={{
                        marginTop: 10,
                        background: 'linear-gradient(90deg, #27ae60 60%, #00b894 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 600,
                        padding: '10px 0',
                        cursor: 'pointer',
                        width: 160,
                        alignSelf: 'flex-end'
                      }}
                    >
                      Continue Payment
                    </button>
                  )}
                </li>
              );
            })}
            {/* Show removed/rejected trips not present in trips */}
            {removedTrips.map((trip, idx) => (
              <li
                key={trip._id || `removed-${idx}`}
                style={{
                  background: 'linear-gradient(100deg, #f9fafc 70%, #eaf6fb 100%)',
                  border: '2.5px solid #e74c3c',
                  borderRadius: 16,
                  boxShadow: '0 4px 18px rgba(44,62,80,0.10)',
                  padding: '28px 32px',
                  margin: 0,
                  width: '100%',
                  maxWidth: 600,
                  transition: 'box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: '#222f3e', marginBottom: 6 }}>
                  {trip.destination}
                </div>
                <div style={{ color: '#636e72', fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                  <span>
                    <strong>Start Date:</strong>{' '}
                    {trip.startDate && trip.startDate !== 'N/A'
                      ? (() => {
                          // Support both Date objects and ISO strings
                          const d = new Date(trip.startDate);
                          return isNaN(d.getTime())
                            ? trip.startDate
                            : d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                        })()
                      : 'N/A'}
                  </span>
                </div>
                <div style={{
                  fontSize: 14,
                  color: '#636e72',
                  marginTop: 2,
                  fontStyle: 'italic'
                }}>
                  Booked At: {trip.createdAt ? new Date(trip.createdAt).toLocaleString() : ''}
                </div>
                <div style={{
                  marginTop: 10,
                  fontWeight: 600,
                  color: '#e74c3c',
                  fontSize: 16
                }}>
                  Status: Rejected
                </div>
                {trip.cancelMsg && (
                  <div style={{
                    marginTop: 12,
                    background: '#fffbe6',
                    border: '1.5px solid #f1c40f',
                    borderRadius: 8,
                    padding: '12px 16px',
                    color: '#b9770e',
                    fontWeight: 600,
                    fontSize: 15
                  }}>
                    <span>Message from Admin: </span>
                    <span>{trip.cancelMsg}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Mytrips;
