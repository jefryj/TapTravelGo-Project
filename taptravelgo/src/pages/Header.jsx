import { useNavigate } from 'react-router-dom';
import React from 'react';

function Header({ search, setSearch }) {
    const navigate = useNavigate();
    return (
        <div className="Header">
            <nav className="navbar">
                <ul className="nav-list" style={{ alignItems: 'center', paddingLeft: 0, marginLeft: 0 }}>
                    <li className="nav-item">
                        <span className="mainheading">TapTravelGo</span>
                    </li>
                    <li className="nav-item">
                        <a href="#" onClick={e => {e.preventDefault(); navigate('/');}}>Home</a>
                    </li>
                    <li className="nav-item"><a href="#contact">Contact</a></li>
                    <li className="nav-item"><a href="#aboutus">AboutUs</a></li>
                    <li className="nav-item">
                        <a href="#" onClick={e => {e.preventDefault(); navigate('/mytrips');}}>MyTrips</a>
                    </li>
                    <li className="nav-item">
                        <a href="#" onClick={e => {e.preventDefault(); navigate('/login');}}>Logout</a>
                    </li>
                    <li className="nav-item" style={{marginLeft: "auto", minWidth: 180, maxWidth: 320}}>
                        <input
                            className="search-bar"
                            type="text"
                            placeholder="Search destination..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                marginBottom: 0,
                                width: '100%',
                                minWidth: 120,
                                maxWidth: 320,
                                padding: '7px 12px',
                                borderRadius: 12, // Added border radius
                                border: '1px solid #b2bec3'
                            }}
                        />
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Header;