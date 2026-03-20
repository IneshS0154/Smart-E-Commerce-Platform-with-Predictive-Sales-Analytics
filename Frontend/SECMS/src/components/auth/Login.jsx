import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import LoginImage from '../../assets/images/login_signup/Login.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add login logic here
    console.log('Login:', { email, password });
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="auth-container">
      <div className="back-link-container">
        <button onClick={() => navigate('/')} className="back-to-home">← Back to Home</button>
      </div>
      <div className="auth-content">
        <div className="auth-form-wrapper">
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Welcome back to ANYWEAR</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <a href="#" className="forgot-password">Forgot Password?</a>

            <button type="submit" className="auth-button">Sign In</button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button className="social-button google-button">
            <span>Sign in with Google</span>
          </button>

          <div className="auth-toggle">
            <p>Don't have an account? <span className="toggle-link" onClick={handleSignUpClick}>Sign Up</span></p>
          </div>
        </div>

        <div className="auth-image-wrapper">
          <div className="auth-image-placeholder">
            <img src={LoginImage} alt="Login" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
