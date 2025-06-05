import React, { useEffect, useState } from 'react';

function Mytrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h2 style={{
        textAlign: 'center',
        marginTop: '2.5rem',
        marginBottom: '2rem',
        color: '#0984e3',
        fontWeight: 700,
        letterSpacing: 1,
        fontFamily: 'serif',
        fontSize: '2.2rem'
      }}>My Trips</h2>
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
        {!loading && trips.length === 0 && (
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
        {!loading && trips.length > 0 && (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            width: '100%',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '28px'
          }}>
            {trips.map((trip, idx) => (
              <li key={trip._id || idx} style={{
                background: 'linear-gradient(100deg, #f9fafc 70%, #eaf6fb 100%)',
                border: '1.5px solid #e0e0e0',
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
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#222f3e', marginBottom: 6 }}>
                  {trip.destination}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginBottom: 8 }}>
                  <span style={{ color: '#0984e3', fontWeight: 600 }}>Passengers: <span style={{ color: '#353b48', fontWeight: 500 }}>{trip.passengers}</span></span>
                  <span style={{ color: '#0984e3', fontWeight: 600 }}>Boarding: <span style={{ color: '#353b48', fontWeight: 500 }}>{trip.boarding}</span></span>
                  <span style={{ color: '#0984e3', fontWeight: 600 }}>Total Bill: <span style={{ color: '#27ae60', fontWeight: 700 }}>₹{trip.bill}</span></span>
                </div>
                <div style={{
                  fontSize: 14,
                  color: '#636e72',
                  marginTop: 2,
                  fontStyle: 'italic'
                }}>
                  Booked At: {trip.createdAt ? new Date(trip.createdAt).toLocaleString() : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Mytrips;
