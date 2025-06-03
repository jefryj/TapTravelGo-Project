import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Detailed.css';

function Detailed() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/packages/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setPkg(data);
      })
      .catch(() => setError('Failed to load package'));
  }, [id]);

  const handleBook = () => {
    // Implement booking logic here (e.g., POST to /api/bookings)
    setBooked(true);
  };

  if (error) return <div className="detailed-error">{error}</div>;
  if (!pkg) return <div className="detailed-loading">Loading...</div>;

  return (
    <div className="detailed-container">
      <h2 className="detailed-title">{pkg.name}</h2>
      <img className="detailed-image" src={pkg.image} alt={pkg.name} />
      <div className="detailed-price">
        <strong>Price:</strong> <span>₹{pkg.price}</span>
      </div>
      <div className="detailed-desc">
        <strong>Description:</strong>
        <div>{pkg.description}</div>
      </div>
      <div className="detailed-longdesc">
        <strong>Detailed Description:</strong>
        <div>{pkg.detailedDescription || 'No detailed description available.'}</div>
      </div>
      <div className="detailed-btn-wrap">
        <button
          onClick={handleBook}
          className={`detailed-book-btn${booked ? ' booked' : ''}`}
          disabled={booked}
        >
          {booked ? 'Booked!' : 'Book'}
        </button>
      </div>
    </div>
  );
}

export default Detailed;
