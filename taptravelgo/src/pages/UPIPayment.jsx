import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function UPIPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const amount = params.get('amount') || '0';
  const bookingId = params.get('bookingId');
  const [paid, setPaid] = useState(false);

  const handlePay = async () => {
    setPaid(true);
    if (bookingId) {
      try {
        await fetch('/api/booking/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId })
        });
      } catch {
        // Optionally show error, but still redirect
      }
    }
    setTimeout(() => {
      navigate('/mytrips');
    }, 2000);
  };

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
        maxWidth: 400,
        width: '100%',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(44,62,80,0.13)',
        padding: 32,
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#0984e3', marginBottom: 18 }}>UPI Payment</h2>
        <div style={{ marginBottom: 24 }}>
          <img src="https://th.bing.com/th/id/OIP.rlMfpFS85-TDG7yEstZzHwHaHa?r=0&rs=1&pid=ImgDetMain"
            alt="UPI" style={{ width: 120, marginBottom: 16 }} />
          <div style={{ fontSize: 18, marginBottom: 8 }}>Pay to: <b>travelgo@upi123</b></div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Amount: <b>₹{amount}</b></div>
          <div style={{ fontSize: 15, color: '#636e72', marginBottom: 18 }}>Scan the QR or click below to simulate payment.</div>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('Thank you for booking with TapTravelGo!')}`}
            alt="QR Message"
          />
        </div>
        {!paid ? (
          <button
            onClick={handlePay}
            style={{
              width: '100%',
              padding: '14px 0',
              background: 'linear-gradient(90deg, #27ae60 60%, #00b894 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 10,
              marginBottom: 10
            }}
          >
            Pay Now
          </button>
        ) : (
          <div style={{ color: '#27ae60', fontWeight: 600, fontSize: 18, marginTop: 10 }}>
            Payment Successful! Redirecting to My Trips...
          </div>
        )}
      </div>
    </div>
  );
}

export default UPIPayment;
