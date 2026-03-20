import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__left">
        <a href="#">Shop</a>
        <a href="#">Men</a>
        <a href="#">Women</a>
      </div>

      <div className="navbar__center">
        <Link to="/" className="navbar__brand">ANYWEAR</Link>
      </div>

      <div className="navbar__right">
        <Link to="/login">Account</Link>
        <a href="#">Search</a>
        <a href="#">Cart</a>
        <a href="#" className="navbar__bag">BAG 0</a>
      </div>
    </nav>
  );
}

export default Navbar;
