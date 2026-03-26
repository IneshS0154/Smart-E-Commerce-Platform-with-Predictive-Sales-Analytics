import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [isCustomer, setIsCustomer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const customerInitial = useMemo(() => {
    const storedName = localStorage.getItem('customerUsername') || '';
    if (storedName.trim().length === 0) return 'U';
    return storedName.trim().charAt(0).toUpperCase();
  }, [isCustomer]);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    setIsCustomer(Boolean(token));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleDocumentMouseDown = (e) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [menuOpen]);

  const handleGoToProfile = () => {
    setMenuOpen(false);
    navigate('/customer-dashboard');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Backend logout is best-effort; we still clear local session below.
    }

    localStorage.removeItem('customer');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUsername');
    localStorage.removeItem('rememberCustomerLogin');
    localStorage.removeItem('admin');
    localStorage.removeItem('seller');
    setMenuOpen(false);
    window.location.reload();
  };

  const handleWomenClick = (e) => {
    e.preventDefault();
    const womensSection = document.getElementById('womens-section');
    if (womensSection) {
      womensSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMenClick = (e) => {
    e.preventDefault();
    const mensSection = document.getElementById('mens-section');
    if (mensSection) {
      mensSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <a href="#">Shop</a>
        <a href="#" onClick={handleMenClick}>Men</a>
        <a href="#" onClick={handleWomenClick}>Women</a>
      </div>

      <div className="navbar__center">
        <Link to="/" className="navbar__brand">ANYWEAR</Link>
      </div>

      <div className="navbar__right">
        {isCustomer ? null : <Link to="/login">Account</Link>}
        {isCustomer ? null : <Link to="/signin">Supplier</Link>}
        <a href="#">Search</a>
        <a href="#">Cart</a>
        <a href="#" className="navbar__bag">BAG 0</a>
        {isCustomer ? (
          <div className="navbar__profile" ref={menuRef}>
            <button
              type="button"
              className="navbar__profile-button"
              aria-label="User menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="navbar__profile-initial">{customerInitial}</span>
            </button>
            {menuOpen ? (
              <div className="navbar__profile-menu" role="menu" aria-label="User menu">
                <button type="button" className="navbar__profile-item" onClick={handleGoToProfile}>
                  Profile
                </button>
                <button type="button" className="navbar__profile-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;
