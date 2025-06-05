import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Booked() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [boarding, setBoarding] = useState('');
  const [bill, setBill] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [bookingTime, setBookingTime] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/packages/${id}`)
      .then(res => res.json())
      .then(data => setPkg(data));
  }, [id]);

  useEffect(() => {
    if (pkg && passengers > 0) {
      setBill(pkg.price * passengers);
    }
  }, [pkg, passengers]);

  const handleSubmit = e => {
    e.preventDefault();
    setBookingTime(new Date().toLocaleString());
    setShowSummary(true);
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
      <h2 style={{
        textAlign: 'center',
        marginTop: '2rem',
        marginBottom: '1.5rem',
        color: '#222f3e',
        fontWeight: 700,
        letterSpacing: 1,
        fontFamily: 'serif'
      }}>{pkg.name}</h2>
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: '#fff',
        borderRadius: 22,
        boxShadow: '0 8px 32px rgba(44,62,80,0.13)',
        padding: 0,
        margin: '0 auto',
        minHeight: 420,
        perspective: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          minHeight: 420,
          transition: 'transform 0.7s cubic-bezier(.4,2,.6,1)',
          transformStyle: 'preserve-3d',
          position: 'relative',
          transform: showSummary ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* Front Side (Booking Form) */}
          <div style={{
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: showSummary ? 1 : 2,
            background: '#f9fafc',
            borderRadius: 22,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            boxShadow: '0 4px 24px rgba(44,62,80,0.10)'
          }}>
            <img
              src={pkg.image}
              alt={pkg.name}
              style={{
                width: '90%',
                borderRadius: 18,
                margin: '1.5rem auto 1.2rem auto',
                maxHeight: 200,
                objectFit: 'cover',
                boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
                display: 'block'
              }}
            />
            <form onSubmit={handleSubmit} style={{ width: '90%', margin: '0 auto' }}>
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
                    padding: 12,
                    borderRadius: 8,
                    border: '1.5px solid #b2bec3',
                    fontSize: 17,
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
                    padding: 12,
                    borderRadius: 8,
                    border: '1.5px solid #b2bec3',
                    fontSize: 17,
                    background: '#fff'
                  }}
                />
              </div>
              <div style={{
                margin: '28px 0 18px 0',
                background: '#f1f2f6',
                borderRadius: 10,
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 18,
                fontWeight: 600,
                boxShadow: '0 1px 4px rgba(44,62,80,0.06)'
              }}>
                <span style={{ color: '#222f3e' }}>Final Bill:</span>
                <span style={{ color: '#27ae60', fontWeight: 700, fontSize: 22 }}>
                  ₹{bill}
                </span>
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px 0',
                  background: 'linear-gradient(90deg, #27ae60 60%, #00b894 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 10,
                  marginBottom: 10,
                  boxShadow: '0 2px 8px rgba(39, 174, 96, 0.08)',
                  transition: 'background 0.2s, opacity 0.2s'
                }}
              >
                Confirm Booking
              </button>
            </form>
          </div>
          {/* Back Side (Booking Summary) */}
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
            borderRadius: 22,
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 24px rgba(44,62,80,0.10)'
          }}>
            <div style={{ padding: 32, width: '90%' }}>
              <h2 style={{
                textAlign: 'center',
                color: '#27ae60',
                fontWeight: 700,
                marginBottom: 18
              }}>Booking Confirmed!</h2>
              <div style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                padding: 22,
                marginBottom: 18
              }}>
                <div style={{ marginBottom: 10 }}><strong>Package:</strong> {pkg.name}</div>
                <div style={{ marginBottom: 10 }}><strong>Passengers:</strong> {passengers}</div>
                <div style={{ marginBottom: 10 }}><strong>Boarding Point:</strong> {boarding}</div>
                <div style={{ marginBottom: 10 }}><strong>Total Bill:</strong> ₹{bill}</div>
                <div style={{ marginBottom: 0, color: '#636e72', fontSize: 15 }}>
                  <strong>Booking Time:</strong> {bookingTime}
                </div>
              </div>
              <div style={{ textAlign: 'center', color: '#0984e3', fontWeight: 500 }}>
                Thank you for booking with TapTravelGo!   
                Your boarding time will be notified soon through your mail.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booked;
