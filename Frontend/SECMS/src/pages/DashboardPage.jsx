import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { SkeletonCard, LoadingSpinner } from '../components/Skeleton';
import { UserRoleLabels } from '../types';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Star, 
  Percent, 
  Truck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, change, changeType, loading }) => {
  if (loading) return <SkeletonCard />;

  return (
    <div className="bg-white border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:border-black group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-black text-white group-hover:bg-gray-800 transition-colors">
          <Icon size={24} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'positive' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="font-medium">{change}</span>
          </div>
        )}
      </div>
      <p className="text-gray-500 uppercase tracking-wider text-xs mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    reviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'ADMIN' || user?.role === 'SUPPORT_STAFF') {
          const usersResponse = await userService.getAllUsers();
          if (usersResponse.success) {
            setStats(prev => ({ ...prev, users: usersResponse.data.length }));
          }
        }
      } catch (error) {
        // Silently handle - non-admin users don't need stats
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const dashboardStats = [
    { icon: Users, label: 'Total Users', value: stats.users, change: '+12%', changeType: 'positive' },
    { icon: Package, label: 'Products', value: '156', change: '+8%', changeType: 'positive' },
    { icon: ShoppingCart, label: 'Orders', value: '89', change: '+24%', changeType: 'positive' },
    { icon: Star, label: 'Reviews', value: '234', change: '-3%', changeType: 'negative' },
  ];

  const quickActions = [
    { icon: Package, label: 'Add Product', path: '/dashboard/products', color: 'bg-black' },
    { icon: ShoppingCart, label: 'View Orders', path: '/dashboard/orders', color: 'bg-gray-800' },
    { icon: Percent, label: 'Create Promotion', path: '/dashboard/promotions', color: 'bg-gray-700' },
    { icon: Truck, label: 'Manage Suppliers', path: '/dashboard/suppliers', color: 'bg-gray-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wider text-black">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.firstName || user?.username}!
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-black text-white">
          <TrendingUp size={20} />
          <span className="font-semibold uppercase tracking-wider text-sm">
            {UserRoleLabels[user?.role] || 'User'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                  <Package size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New order placed</p>
                  <p className="text-sm text-gray-500">Order #ORD-{1000 + item} - 2 hours ago</p>
                </div>
                <span className="text-green-600 font-semibold">+$49.99</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="flex items-center gap-4 p-4 border border-gray-200 hover:border-black transition-all duration-300 group"
                >
                  <div className={`${action.color} text-white p-2 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <span className="font-medium uppercase tracking-wider text-sm">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
