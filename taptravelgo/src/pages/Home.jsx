import React from 'react';
import './Home.css';

function Home({ search, setSearch }) {
  const destinations = [
    {
      name: "Alappuzha, Kerala",
      img: "https://th.bing.com/th/id/OIP.4Djsqg7G41t9S7MteSRI2QHaE8?w=750&h=500&rs=1&pid=ImgDetMain",
      desc: "Experience the serene backwaters and houseboats of Kerala's Venice.",
      rate: "₹7,999"
    },
    {
      name: "Manali, Himachal Pradesh",
      img: "https://www.tripsavvy.com/thmb/zyqX35L3rgFRuVrbGioDKoqPezc=/2121x1414/filters:fill(auto,1)/GettyImages-930881934-5ae56fe48023b90036464e72.jpg",
      desc: "Enjoy snow-capped mountains, adventure sports, and scenic valleys.",
      rate: "₹9,499"
    },
    {
      name: "Goa",
      img: "https://deih43ym53wif.cloudfront.net/cola-beach-goa-india-shutterstock_772145203_82b97bd9df.jpeg",
      desc: "Relax on golden beaches and experience vibrant nightlife and culture.",
      rate: "₹8,299"
    },
    {
      name: "Jaipur, Rajasthan",
      img: "https://th.bing.com/th/id/OIP.Dgef0y0ZHUXw9tfIaVzfdAHaEb?cb=iwp2&rs=1&pid=ImgDetMain",
      desc: "Discover royal palaces, forts, and the rich heritage of the Pink City.",
      rate: "₹7,499"
    },
    {
      name: "Rann of Kutch, Gujarat",
      img: "https://www.stayvista.com/blog/wp-content/uploads/2023/10/51560305941_3dec221e4f_o.jpg",
      desc: "Marvel at the vast white salt desert and enjoy the Rann Utsav festival.",
      rate: "₹10,299"
    },
    {
      name: "Sundarbans, West Bengal",
      img: "https://www.adotrip.com/public/images/areas/master_images/5f0dbcaae5cb0-Sundarbans_Attractions.jpg",
      desc: "Explore the world's largest mangrove forest and spot the Royal Bengal Tiger.",
      rate: "₹8,999"
    }
  ];

  const slantImages = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "https://wallpapercave.com/wp/wp6539434.jpg",
    "https://th.bing.com/th/id/OIP.YP-s0EIDK77tMeijKrBxAgHaE8?cb=iwp2&rs=1&pid=ImgDetMain",
    "https://www.puredestinations.co.uk/wp-content/uploads/2016/11/TAJ-MAHAL-PD-BLOG.jpg"
  ];

  const filtered = destinations.filter(d =>
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
          <div className="card" key={d.name}>
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
