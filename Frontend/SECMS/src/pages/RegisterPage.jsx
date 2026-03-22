import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/Skeleton';
import { UserRoleOptions } from '../types';
import { 
  ArrowRight, 
  CheckCircle2,
  Shield,
  Zap,
  BarChart3,
  Globe,
  Lock,
  Award
} from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'CUSTOMER',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
    setError('');
  };

  const validateForm = () => {
    const errors = {};

    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Track performance with AI insights' },
    { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade protection' },
    { icon: Zap, title: 'Instant Setup', desc: 'Launch in minutes, not days' },
    { icon: Globe, title: 'Global Reach', desc: 'Sell worldwide with ease' },
  ];

  const includedFeatures = [
    'Unlimited product listings',
    'AI-powered inventory predictions',
    'Real-time sales analytics',
    'Supplier management tools',
    'Customer relationship management',
    'Automated marketing campaigns',
    'Multi-channel integration',
    '24/7 priority support',
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Benefits Panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-bl from-gray-900 via-black to-gray-800"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-3xl"></div>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-white/20 rotate-45 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-white/20 rotate-45 animate-pulse delay-75"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full px-16 py-12 overflow-y-auto">
          {/* Logo */}
          <div className="animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-[0.15em] text-white">
                ANYWEAR
              </h1>
              <p className="text-sm uppercase tracking-[0.6em] text-gray-400 mt-2">
                EVERYWHERE
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="py-8">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/10 text-white text-xs uppercase tracking-wider rounded-full">
                  Join the Future
                </span>
              </div>
              
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight animate-slide-up">
                Start Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  Transformation
                </span>
              </h2>
              
              <p className="text-gray-400 leading-relaxed mb-8 animate-fade-in">
                Join thousands of businesses already leveraging AI to revolutionize their e-commerce operations. 
                Get predictive insights, automate workflows, and scale your business effortlessly.
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index}
                      className="p-4 bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <Icon className="w-5 h-5 text-white mb-2" />
                      <p className="text-white font-semibold text-sm uppercase tracking-wider">{benefit.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{benefit.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Included Features */}
              <div className="p-6 bg-white/5 border border-white/10">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Everything You Get
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {includedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 animate-fade-in">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs">256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="w-4 h-4" />
              <span className="text-xs">99.9% Uptime SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center px-8 py-12 bg-white relative overflow-y-auto">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10">
            <div className="text-center">
              <h1 className="text-5xl font-bold uppercase tracking-[0.15em]">ANYWEAR</h1>
              <p className="text-sm uppercase tracking-[0.6em] text-gray-400 mt-2">EVERYWHERE</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-black mb-1 animate-slide-up">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm animate-fade-in">
              Join the next generation of e-commerce
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 text-sm border border-gray-200 focus:border-black focus:outline-none transition-all duration-300 bg-gray-50/50"
                  placeholder="John"
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 text-sm border border-gray-200 focus:border-black focus:outline-none transition-all duration-300 bg-gray-50/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Username */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full px-3 py-3 text-sm border focus:outline-none transition-all duration-300 bg-gray-50/50 ${
                  validationErrors.username ? 'border-red-500' : 'border-gray-200 focus:border-black'
                }`}
                placeholder="johndoe123"
              />
              {validationErrors.username && (
                <p className="mt-1 text-[10px] text-red-500">{validationErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-3 py-3 text-sm border focus:outline-none transition-all duration-300 bg-gray-50/50 ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-200 focus:border-black'
                }`}
                placeholder="john@example.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-[10px] text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Role */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-3 text-sm border border-gray-200 focus:border-black focus:outline-none transition-all duration-300 bg-gray-50/50"
              >
                {UserRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone & Address */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-3 text-sm border border-gray-200 focus:border-black focus:outline-none transition-all duration-300 bg-gray-50/50"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-3 text-sm border border-gray-200 focus:border-black focus:outline-none transition-all duration-300 bg-gray-50/50"
                placeholder="123 Main St, City"
              />
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-3 text-sm border focus:outline-none transition-all duration-300 bg-gray-50/50 ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-200 focus:border-black'
                }`}
                placeholder="Min. 6 characters"
              />
              {validationErrors.password && (
                <p className="mt-1 text-[10px] text-red-500">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-3 py-3 text-sm border focus:outline-none transition-all duration-300 bg-gray-50/50 ${
                  validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-black'
                }`}
                placeholder="Confirm your password"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-[10px] text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 text-xs">
              <input type="checkbox" required className="w-4 h-4 mt-0.5 accent-black" />
              <span className="text-gray-500">
                I agree to the{' '}
                <a href="#" className="text-black underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-black underline">Privacy Policy</a>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white px-6 py-4 font-bold uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span className="animate-pulse">Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-black font-bold uppercase tracking-wider hover:underline inline-flex items-center gap-1"
              >
                Sign In
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-3 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            © 2026 ANYWEAR AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
