import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { SkeletonTable, LoadingSpinner } from '../components/Skeleton';
import { UserRoleLabels, UserRole } from '../types';
import { 
  Users as UsersIcon, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users. Please ensure you have permission.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    setActionLoading(userId);
    try {
      await userService.deactivateUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId) => {
    setActionLoading(userId);
    try {
      await userService.activateUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to activate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setActionLoading(userId);
    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: 'bg-black text-white',
      CUSTOMER: 'bg-gray-200 text-gray-800',
      SUPPLIER: 'bg-gray-300 text-gray-800',
      SUPPORT_STAFF: 'bg-gray-400 text-white',
    };
    return colors[role] || 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wider text-black">
            Users
          </h1>
          <p className="text-gray-500 mt-1">
            Manage all registered users
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-black focus:outline-none transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:border-black focus:outline-none bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.CUSTOMER}>Customer</option>
            <option value={UserRole.SUPPLIER}>Supplier</option>
            <option value={UserRole.SUPPORT_STAFF}>Support Staff</option>
          </select>
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <UsersIcon size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                          {UserRoleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-2 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {user.phoneNumber || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {actionLoading === user.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              {user.isActive ? (
                                <button
                                  onClick={() => handleDeactivate(user.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Deactivate"
                                >
                                  <UserX size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(user.id)}
                                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                                  title="Activate"
                                >
                                  <UserCheck size={18} />
                                </button>
                              )}
                              <button
                                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              {user.role !== 'ADMIN' && (
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
