import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Add sign up logic here
    navigate('/home');
  };

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
        <p className="sub-text">Create your account and start your journey!</p>
        <p className="sub-text">Sign up to explore the best travel experiences.</p>
      </div>
      <div className="login-card">
        <h2 className="login-title">Sign Up</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Phone Number
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Sign Up</button>
        </form>
        <div className="login-footer">
          <span>Already have an account?</span>
          <a href="#" className="signup-link" onClick={e => { e.preventDefault(); navigate('/login'); }}>Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
