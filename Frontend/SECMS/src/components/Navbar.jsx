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
        <a href="#" className="navbar__brand">ANYWEAR</a>
      </div>

      <div className="navbar__right">
        <a href="#">Search</a>
        <a href="#">Account</a>
        <a href="#" className="navbar__bag">BAG 0</a>
      </div>
    </nav>
  );
}

export default Navbar;
