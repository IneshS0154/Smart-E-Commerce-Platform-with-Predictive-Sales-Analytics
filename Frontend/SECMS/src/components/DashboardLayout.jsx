import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Star, 
  Percent, 
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Users', path: '/dashboard/users', roles: ['ADMIN', 'SUPPORT_STAFF'] },
  { icon: Package, label: 'Products', path: '/dashboard/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders' },
  { icon: Star, label: 'Reviews', path: '/dashboard/reviews' },
  { icon: Percent, label: 'Promotions', path: '/dashboard/promotions', roles: ['ADMIN'] },
  { icon: Truck, label: 'Suppliers', path: '/dashboard/suppliers', roles: ['ADMIN', 'SUPPLIER'] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-800">
            <Link to="/dashboard" className="block">
              <h1 className="text-2xl font-bold uppercase tracking-wider">
                ANYWEAR
              </h1>
              <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                AI Commerce
              </p>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-300 ${
                    isActive 
                      ? 'bg-white text-black' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium uppercase tracking-wider text-sm">
                    {item.label}
                  </span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-all duration-300"
            >
              <LogOut size={20} />
              <span className="font-medium uppercase tracking-wider text-sm">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="relative hidden md:block">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 focus:border-black focus:outline-none transition-colors w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold uppercase tracking-wider">
                      {user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      {user?.role || 'Guest'}
                    </p>
                  </div>
                </button>

                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-20 animate-fade-in">
                      <div className="p-4 border-b border-gray-200">
                        <p className="font-semibold">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
