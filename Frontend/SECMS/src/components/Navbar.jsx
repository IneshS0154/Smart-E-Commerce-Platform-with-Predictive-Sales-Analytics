import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../api/authService';
import { useCart } from '../context/CartContext';
import searchIcon from '../assets/icons/search.svg';
import shoppingBagIcon from '../assets/icons/shopping_bag.svg';
import SearchOverlay from './SearchOverlay';
import './Navbar.css';
import TopMarqueeBar from './TopMarqueeBar';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProductPage = location.pathname.startsWith('/product/');
  const hideShopLink = !isHomePage;
  const leftAlignBrand = !isHomePage;
  
  const [isCustomer, setIsCustomer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const { cartCount, fetchCart } = useCart();

  const customerInitial = useMemo(() => {
    const storedName = localStorage.getItem('customerUsername') || '';
    if (storedName.trim().length === 0) return 'U';
    return storedName.trim().charAt(0).toUpperCase();
  }, [isCustomer]);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    setIsCustomer(Boolean(token));
    if (token) {
      fetchCart();
    }
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

  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show if near the top (e.g., elastic scrolling past 0 or just resting at top)
      if (currentScrollY <= 80) {
        setIsHidden(false);
      } 
      // Scrolling DOWN by more than 5px -> Hide
      else if (currentScrollY > lastScrollY.current + 5) {
        setIsHidden(true);
        setMenuOpen(false); // auto-close user menu
      } 
      // Scrolling UP by more than 5px -> Show
      else if (currentScrollY < lastScrollY.current - 5) {
        setIsHidden(false);
      }
      
      // Update the accumulated scroll position
      lastScrollY.current = currentScrollY;
    };

    // Set initial
    lastScrollY.current = window.scrollY;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <>
      <TopMarqueeBar />
      <nav className={`navbar ${isHidden ? 'navbar--hidden' : ''}`}>
        <div className="navbar__left">
        {leftAlignBrand && (
          <Link to="/" className="navbar__brand" style={{ marginRight: '20px' }}>ANYWEAR</Link>
        )}
        {!hideShopLink && <Link to="/shop">Shop</Link>}
        {isHomePage && (
          <>
            <a href="#" onClick={handleMenClick}>Men</a>
            <a href="#" onClick={handleWomenClick}>Women</a>
          </>
        )}
      </div>

      <div className="navbar__center">
        {!leftAlignBrand && (
          <Link to="/" className="navbar__brand">ANYWEAR</Link>
        )}
      </div>
      <div className="navbar__right">
        {isCustomer ? null : (
          <Link to="/login" className="navbar__icon-link" aria-label="Login">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        )}
        <a href="#" className="navbar__icon-link" aria-label="Search" onClick={(e) => { e.preventDefault(); setIsSearchOpen(true); }}>
          <img src={searchIcon} alt="Search" className="navbar__icon" />
        </a>
        <Link to="/cart" className="navbar__icon-link navbar__cart" aria-label="Cart">
          <img src={shoppingBagIcon} alt="Cart" className="navbar__icon" />
          {cartCount > 0 && <span className="navbar__cart-count">{cartCount}</span>}
        </Link>
        {isCustomer ? null : <Link to="/signin" >Supplier</Link>}
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
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

export default Navbar;
