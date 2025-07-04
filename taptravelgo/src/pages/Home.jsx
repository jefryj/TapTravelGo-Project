import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home({ search, setSearch }) {
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(err => setPackages([]));
  }, []);

  const slantImages = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "https://wallpapercave.com/wp/wp6539434.jpg",
    "https://th.bing.com/th/id/OIP.YP-s0EIDK77tMeijKrBxAgHaE8?cb=iwp2&rs=1&pid=ImgDetMain",
    "https://www.puredestinations.co.uk/wp-content/uploads/2016/11/TAJ-MAHAL-PD-BLOG.jpg"
  ];

  const filtered = packages.filter(d =>
    d.name.toLowerCase().includes((search || '').toLowerCase())
  );

  return (
    <div className="Home">
      <h1 className="home-title">
        Welcome to TapTravelGo!
      </h1>
      <h2 className="subheading home-subheading">
        Your Gateway to Seamless Travel Experiences
      </h2>
      <div className="slant-cards-container">
        {slantImages.map((img, idx) => (
          <div className="slant-card" key={idx}>
            <img src={img} alt={`Tourist spot ${idx + 1}`} />
          </div>
        ))}
      </div>
      <div className="about-taptravelgo-highlight">
        <span>
          TapTravelGo is your trusted companion for discovering, planning, and booking the most memorable journeys across India.
          We curate the best destinations and experiences, making travel easy, affordable, and unforgettable.
        </span>
      </div>
      <h2 className="available-packages-heading">Available Packages</h2>
      <div className="card-container">
        {filtered.map((pkg) => (
          <div
            key={pkg._id}
            onClick={() => navigate(`/detailed/${pkg._id}`)}
            style={{ cursor: 'pointer' }}
            className="card"
          >
            <img src={pkg.img} alt={pkg.name} className="card-img" />
            <h3>{pkg.name}</h3>
            <p>{pkg.desc}</p>
            <div className="card-rate">{pkg.rate}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
