import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/Skeleton';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight,
  Box,
  Award
} from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const credentials = {
      admin: { username: 'admin123', password: 'admin123' },
      customer: { username: 'customer123', password: 'customer123' },
      supplier: { username: 'supplier123', password: 'supplier123' },
    };

    setFormData(credentials[role]);
    setError('');
    setIsLoading(true);

    try {
      const result = await login(credentials[role].username, credentials[role].password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Demo login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp, title: 'Predictive Analytics', desc: 'AI-powered inventory forecasting' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption & protection' },
    { icon: Zap, title: 'Real-time Insights', desc: 'Live data processing & analytics' },
    { icon: Globe, title: 'Global Scale', desc: 'Multi-currency & multi-language' },
  ];

  const stats = [
    { value: '500+', label: 'Products' },
    { value: '10K+', label: 'Orders' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Premium Brand Panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-20 left-20 w-[500px] h-[500px] border border-white/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute bottom-20 right-20 w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin_15s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_25s_linear_infinite]"></div>
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvc3ZnPg==')] opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full px-16 py-12">
          {/* Logo */}
          <div className="animate-fade-in">
            <div>
              <h1 className="text-5xl font-bold uppercase tracking-[0.15em] text-white">
                ANYWEAR
              </h1>
              <p className="text-sm uppercase tracking-[0.6em] text-gray-400 mt-2">
                EVERYWHERE
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/10 text-white text-xs uppercase tracking-wider rounded-full">
                  Next Generation
                </span>
              </div>
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight animate-slide-up">
                Revolutionize Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  E-Commerce Future
                </span>
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Experience the future of retail with intelligent inventory management, 
                predictive analytics, and seamless supplier integration — all in one powerful platform.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap8">
-4 mb-                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="p-4 bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500 group"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <Icon className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-white font-semibold text-sm uppercase tracking-wider">{feature.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6 border-t border-white/10">
                {stats.map((stat, index) => (
                  <div key={index} className="animate-slide-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demo Access */}
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="p-6 bg-white/5 border border-white/10">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
                Experience the Platform
              </p>
              <div className="flex gap-3">
                {['admin', 'customer', 'supplier'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleDemoLogin(role)}
                    className="flex-1 px-4 py-3 border border-white/20 text-white text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    {role}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center px-8 py-12 bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10">
            <div className="text-center">
              <h1 className="text-5xl font-bold uppercase tracking-[0.15em]">ANYWEAR</h1>
              <p className="text-sm uppercase tracking-[0.6em] text-gray-400 mt-2">EVERYWHERE</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold uppercase tracking-wider text-black mb-2 animate-slide-up">
              Welcome Back
            </h2>
            <p className="text-gray-500 animate-fade-in">
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label 
                htmlFor="username" 
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 transition-colors group-focus-within:text-black"
              >
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 border border-gray-200 focus:border-black focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                  placeholder="Enter your username"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-1 bg-black scale-0 group-focus-within:scale-100 transition-transform duration-300"></div>
              </div>
            </div>

            <div className="group">
              <label 
                htmlFor="password" 
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 transition-colors group-focus-within:text-black"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 border border-gray-200 focus:border-black focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-1 bg-black scale-0 group-focus-within:scale-100 transition-transform duration-300"></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-black" />
                <span className="text-gray-500 uppercase tracking-wider">Remember me</span>
              </label>
              <a href="#" className="text-black uppercase tracking-wider hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white px-6 py-4 font-bold uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span className="animate-pulse">Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-black font-bold uppercase tracking-wider hover:underline inline-flex items-center gap-1"
              >
                Create Account
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

          {/* Decorative Line */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">or</p>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Login */}
          <div className="mt-6 flex gap-3">
            <button className="flex-1 px-4 py-3 border border-gray-200 hover:border-black transition-all duration-300 flex items-center justify-center gap-2 group">
              <Box className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 group-hover:text-black">Google</span>
            </button>
            <button className="flex-1 px-4 py-3 border border-gray-200 hover:border-black transition-all duration-300 flex items-center justify-center gap-2 group">
              <Globe className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 group-hover:text-black">Apple</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            © 2026 ANYWEAR AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
