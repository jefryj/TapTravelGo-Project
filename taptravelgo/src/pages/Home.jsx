import React, { useEffect, useState } from 'react';
import './Home.css';

function Home({ search, setSearch }) {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/packages')
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
        {filtered.map((d) => (
          <div className="card" key={d._id || d.name}>
            <img src={d.img} alt={d.name} className="card-img"/>
            <h3>{d.name}</h3>
            <p>{d.desc}</p>
            <div className="card-rate">{d.rate}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
