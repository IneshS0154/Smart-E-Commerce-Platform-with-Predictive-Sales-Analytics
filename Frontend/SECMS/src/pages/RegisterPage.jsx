import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { authService, setAuthToken, setCurrentUser } from '../services/api';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CUSTOMER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
      });
      
      const loginResponse = await authService.login(formData.email, formData.password);
      setAuthToken(loginResponse.token);
      setCurrentUser({
        id: loginResponse.userId,
        email: loginResponse.email,
        role: loginResponse.role,
      });
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Write reviews for products',
    'Rate and share experiences',
    'Help other customers',
    'Track your review history',
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
            JOIN
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              ANYWEAR
            </span>
          </h1>
          <p className="text-gray-400 text-xl mb-12 font-light tracking-wide animate-fade-in-up stagger-1">
            Become Part of Our Community
          </p>

          <div className="space-y-4 animate-fade-in-up stagger-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300 font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-4 mb-6">
              {[5, 4, 5, 5, 4].map((star, i) => (
                <Star key={i} className={`w-5 h-5 ${star === 5 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-500 text-gray-500'}`} />
              ))}
              <span className="text-gray-400 text-sm ml-2">4.8/5 from 10,000+ reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-black/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-black/5 rounded-full blur-2xl"></div>
        
        <div className="w-full max-w-lg relative z-10">
          <div className="lg:hidden mb-8 text-center animate-fade-in">
            <h1 className="font-heading text-4xl tracking-widest mb-2">ANYWEAR</h1>
            <p className="text-gray-500 font-medium">EVERYWHERE</p>
          </div>

          <div className="bg-white border-0 shadow-2xl p-8 animate-fade-in-up" style={{ borderRadius: '20px' }}>
            <h2 className="font-heading text-2xl tracking-wider mb-2">CREATE ACCOUNT</h2>
            <p className="text-gray-500 text-sm mb-6">Join thousands of customers</p>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300"
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Account Type
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300 bg-white"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="SUPPORT_STAFF">Support Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300 pr-12"
                    placeholder="Create password"
                    required
                    minLength={6}
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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-black focus:outline-none transition-all duration-300"
                  placeholder="Confirm password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-black hover:underline decoration-2 underline-offset-4">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center animate-fade-in-up stagger-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              By registering, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
