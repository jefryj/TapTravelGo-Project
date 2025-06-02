import { useNavigate } from 'react-router-dom';
import React from 'react';

function Header({ search, setSearch }) {
    const navigate = useNavigate();
    return (
        <div className="Header">
            <nav className="navbar">
                <ul className="nav-list">
                    <li className="nav-item">
                        <span className="mainheading">TapTravelGo</span>
                    </li>
                    <li className="nav-item">
                        <a href="#" onClick={e => {e.preventDefault(); navigate('/');}}>Home</a>
                    </li>
                    <li className="nav-item"><a href="#contact">Contact</a></li>
                    <li className="nav-item"><a href="#aboutus">AboutUs</a></li>
                    <li className="nav-item">
                        <a href="#" onClick={e => {e.preventDefault(); navigate('/login');}}>Logout</a>
                    </li>
                    <li className="nav-item" style={{marginLeft: "2rem"}}>
                        <input
                            className="search-bar"
                            type="text"
                            placeholder="Search destination..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{marginBottom: 0, minWidth: 180}}
                        />
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Header;