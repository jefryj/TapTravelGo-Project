import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Detailed.css';

function Detailed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);

  // For image slider/transition
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:5000/api/packages/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setPkg(data);
      })
      .catch(() => setError('Failed to load package'));
  }, [id]);

  useEffect(() => {
    if (pkg && pkg.images && pkg.images.length === 3) {
      const interval = setInterval(() => {
        setCurrentImg(prev => (prev + 1) % 3);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [pkg]);

  const handleBook = () => {
    navigate(`/booked/${pkg._id}`);
  };

  if (error) return <div className="detailed-error">{error}</div>;
  if (!pkg) return <div className="detailed-loading">Loading...</div>;

  return (
    <div className="detailed-container">
      <h2 className="detailed-title">{pkg.name}</h2>
      {/* Only show the 3 extra images as a slider */}
      {pkg.images && pkg.images.length === 3 && (
        <div className="detailed-gallery-slider">
          {pkg.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Gallery ${idx + 1}`}
              className={`detailed-gallery-img${currentImg === idx ? ' active' : ''}`}
              style={{ opacity: currentImg === idx ? 1 : 0, zIndex: currentImg === idx ? 2 : 1 }}
            />
          ))}
          <div className="detailed-gallery-dots">
            {pkg.images.map((_, idx) => (
              <span
                key={idx}
                className={currentImg === idx ? 'active' : ''}
                onClick={() => setCurrentImg(idx)}
              />
            ))}
          </div>
        </div>
      )}
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
      <div className="detailed-days-cards">
        {[1,2,3,4,5].map(day => (
          <div className="detailed-day-card" key={day}>
            <div className="detailed-day-title">Day {day}</div>
            <div className="detailed-day-content">{pkg[`day${day}`]}</div>
          </div>
        ))}
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
