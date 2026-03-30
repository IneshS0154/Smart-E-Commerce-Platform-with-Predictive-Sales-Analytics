import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ReviewsPage from './pages/ReviewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { getAuthToken, getCurrentUser, setAuthToken, setCurrentUser } from './services/api';
import { ShoppingBag, Package, Star, Menu, X, ArrowRight } from 'lucide-react';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

function MainLayout() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const currentUser = getCurrentUser();
    setIsAuthenticated(!!token);
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Package },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { to: '/reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <>
      <header className="bg-black text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="font-heading text-2xl tracking-widest hover:text-gray-300 transition-colors">
              ANYWEAR
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 uppercase font-bold text-sm tracking-wider hover:text-gray-300 transition-all duration-300 relative group"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-400 font-medium">
                    {user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 uppercase font-bold text-sm tracking-wider hover:text-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-black px-6 py-2 font-bold uppercase text-sm tracking-wider hover:bg-gray-200 transition-all duration-300"
                >
                  Login
                </Link>
              )}
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 uppercase font-bold text-sm tracking-wider hover:text-gray-300 transition-colors py-2"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left uppercase font-bold text-sm tracking-wider hover:text-gray-300 transition-colors py-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left bg-white text-black px-6 py-3 font-bold uppercase text-sm tracking-wider text-center"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-0 py-0">
        <Routes>
          <Route path="/" element={<HomePage user={user} isAuthenticated={isAuthenticated} />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
        </Routes>
      </main>

      <footer className="bg-black text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="font-heading text-2xl tracking-widest mb-4">ANYWEAR</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Your trusted destination for premium footwear and apparel. Quality products, authentic reviews, seamless experience.</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-6">Products</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/products" className="hover:text-white transition-colors">Running Shoes</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Lifestyle</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Basketball</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Training</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/reviews" className="hover:text-white transition-colors">Customer Reviews</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-6">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 ANYWEAR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function HomePage({ user, isAuthenticated }) {
  return (
    <div className="space-y-0">
      <section className="relative py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/10 rounded-full"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="font-heading text-5xl md:text-8xl tracking-widest mb-6 animate-fade-in-up">
            <span className="text-white">ANYWEAR</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">EVERYWHERE</span>
          </h2>
          <p className="text-gray-400 text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1">
            Discover premium footwear and apparel. Read authentic reviews. Shop with confidence.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col md:flex-row justify-center gap-4 animate-fade-in-up stagger-2">
              <Link
                to="/register"
                className="bg-white text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="bg-transparent text-white px-10 py-4 font-bold uppercase tracking-widest border-2 border-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <Link to="/products" className="group bg-white p-12 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-r border-gray-100 last:border-r-0 animate-fade-in-up">
              <div className="text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <h3 className="font-heading text-2xl mb-3 tracking-wider">PRODUCTS</h3>
              <p className="text-gray-500">Browse our collection of premium footwear and apparel</p>
            </Link>
            <Link to="/reviews" className="group bg-white p-12 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-r border-gray-100 animate-fade-in-up stagger-1">
              <div className="text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-12 h-12" />
              </div>
              <h3 className="font-heading text-2xl mb-3 tracking-wider">REVIEWS</h3>
              <p className="text-gray-500">Read authentic reviews from real customers</p>
            </Link>
            <Link to="/products" className="group bg-white p-12 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up stagger-2">
              <div className="text-black mb-6 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-12 h-12" />
              </div>
              <h3 className="font-heading text-2xl mb-3 tracking-wider">QUALITY</h3>
              <p className="text-gray-500">Premium quality in every product we offer</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductsPage() {
  return (
    <div className="py-12">
      <div className="bg-black text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="font-heading text-5xl md:text-6xl tracking-widest mb-4">OUR PRODUCTS</h2>
          <p className="text-gray-400 text-lg">Premium Footwear & Apparel</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Package className="w-20 h-20 mx-auto text-gray-300 mb-6" />
        <h3 className="font-heading text-3xl mb-4 tracking-wider">COMING SOON</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">Our product catalog is under development. Check back soon for amazing products!</p>
      </div>
    </div>
  );
}

export default App;
