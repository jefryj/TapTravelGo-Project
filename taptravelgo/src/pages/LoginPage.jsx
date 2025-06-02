import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // Use the backend URL explicitly if running frontend on a different port
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/home');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  // Remove top padding for login page by overriding body padding
  React.useEffect(() => {
    const originalPadding = document.body.style.paddingTop;
    document.body.style.paddingTop = '0px';
    return () => {
      document.body.style.paddingTop = originalPadding;
    };
  }, []);

 return (
  <div className="login-bg">
    <div className="login-left">
      <h1 className="main-heading">TapTravelGo</h1>
      <p className="sub-text">Your next adventure begins here.</p>
      <p className="sub-text">Book smarter. Travel better.</p>
    </div>

    <div className="login-card">
      <h2 className="login-title">Sign In</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Login</button>
      </form>
      <div className="login-footer">
        <span>Don't have an account?</span>
        <a
          href="#"
          className="signup-link"
          onClick={e => {
            e.preventDefault();
            navigate('/signup');
          }}
        >
          Sign Up
        </a>
      </div>
    </div>
  </div>
);
}

export default LoginPage;