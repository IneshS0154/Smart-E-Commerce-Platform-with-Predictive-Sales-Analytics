import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Shield, User, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { authService, setAuthToken, setCurrentUser } from '../services/api';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      setAuthToken(response.token);
      setCurrentUser({
        id: response.userId,
        email: response.email,
        role: response.role,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (type) => {
    if (type === 'admin') {
      setEmail('admin123@anywear.com');
      setPassword('admin123');
    } else {
      setEmail('customer123@anywear.com');
      setPassword('customer123');
    }
  };

  const features = [
    'Write and read product reviews',
    'Rate your favorite products',
    'Help other customers decide',
    'Admin moderation tools',
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <h1 className="font-heading text-6xl md:text-7xl tracking-widest mb-6 animate-fade-in-up">
            ANYWEAR
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              EVERYWHERE
            </span>
          </h1>
          <p className="text-gray-400 text-xl mb-12 font-light tracking-wide animate-fade-in-up stagger-1">
            Join Our Community of Customers
          </p>

          <div className="space-y-4 animate-fade-in-up stagger-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/20 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-600 border-2 border-black flex items-center justify-center text-white text-sm font-bold">JD</div>
                <div className="w-12 h-12 rounded-full bg-gray-500 border-2 border-black flex items-center justify-center text-white text-sm font-bold">MK</div>
                <div className="w-12 h-12 rounded-full bg-gray-400 border-2 border-black flex items-center justify-center text-white text-sm font-bold">AS</div>
              </div>
              <div>
                <p className="font-bold">Join 10,000+ members</p>
                <p className="text-gray-400 text-sm">Share your experience today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-black/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-black/5 rounded-full blur-2xl"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden mb-10 text-center animate-fade-in">
            <h1 className="font-heading text-4xl tracking-widest mb-2">ANYWEAR</h1>
            <p className="text-gray-500 font-medium">EVERYWHERE</p>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 animate-fade-in-up">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="group flex items-center justify-center gap-3 bg-black text-white py-4 px-6 font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('customer')}
              className="group flex items-center justify-center gap-3 bg-gray-100 text-black py-4 px-6 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Customer</span>
            </button>
          </div>

          <div className="bg-white border-0 shadow-2xl p-8 animate-fade-in-up stagger-1" style={{ borderRadius: '20px' }}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300 pr-12"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-black hover:underline decoration-2 underline-offset-4">
                  Register Now
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center animate-fade-in-up stagger-2">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Trusted by thousands worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
