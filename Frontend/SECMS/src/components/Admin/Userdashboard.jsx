import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customerAPI from '../../api/customerAPI';
import './Userdashboard.css';

export default function Userdashboard({ activeNav: activeNavProp, onNavChange }) {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState(activeNavProp ?? 'Users');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState({
        firstName: '', lastName: '', email: '', password: '',
        phoneNumber: '', address: '', city: '', postalCode: ''
    });

    const admin = JSON.parse(localStorage.getItem('admin') || '{}') || {};
    const adminUsername = admin?.username || admin?.name || 'Admin';

    const handleLogout = () => {
        localStorage.removeItem('admin');
        localStorage.removeItem('seller');
        localStorage.removeItem('customer');
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUsername');
        localStorage.removeItem('rememberSellerLogin');
        localStorage.removeItem('rememberCustomerLogin');
        navigate('/');
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerAPI.getAllCustomers();
            const formatted = (Array.isArray(response) ? response : []).map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber || 'N/A',
                address: user.address || 'N/A',
                status: user.status === 'ACTIVE' ? 'Active' :
                        user.status === 'DEACTIVATED' ? 'Deactivated' : user.status,
                role: user.role,
                date: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: '2-digit', year: '2-digit'
                }) : 'N/A',
            }));
            setUsers(formatted);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.response?.data?.message || error.message || 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleNavClick = (label) => {
        setActiveNav(label);
        if (onNavChange) onNavChange(label);
    };

    const filtered = users.filter(u =>
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const deactivatedUsers = users.filter(u => u.status === 'Deactivated').length;

    const handleAddUser = async () => {
        const { firstName, lastName, email, password } = newUser;
        if (!firstName || !lastName || !email || !password) {
            alert('Please fill in all required fields (first name, last name, email, password).');
            return;
        }
        try {
            await customerAPI.getAllCustomers();
            alert('Customer registration should be done through the customer signup page.');
            setShowModal(false);
            setNewUser({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', address: '', city: '', postalCode: '' });
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user');
        }
    };

    const handleViewUser = (user) => {
        setViewUser(user);
        setShowViewModal(true);
    };

    const handleEditUser = (user) => {
        setEditUser({ ...user });
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        if (!editUser) return;
        try {
            const updated = await customerAPI.updateCustomer(editUser.id, {
                firstName: editUser.firstName,
                lastName: editUser.lastName,
                email: editUser.email,
                phoneNumber: editUser.phoneNumber,
                address: editUser.address,
                city: editUser.city,
                postalCode: editUser.postalCode,
            });
            setUsers(prev => prev.map(u => u.id === updated.id ? {
                ...u,
                firstName: updated.firstName,
                lastName: updated.lastName,
                email: updated.email,
                phoneNumber: updated.phoneNumber || 'N/A',
                address: updated.address || 'N/A',
                city: updated.city || 'N/A',
                postalCode: updated.postalCode || 'N/A',
            } : u));
            setShowEditModal(false);
            setEditUser(null);
            alert('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    const handleDeactivateUser = async (userId) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await customerAPI.deactivateCustomer(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Deactivated' } : u));
            alert('User deactivated successfully');
        } catch (error) {
            console.error('Error deactivating user:', error);
            alert('Failed to deactivate user');
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await customerAPI.activateCustomer(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Active' } : u));
            alert('User activated successfully');
        } catch (error) {
            console.error('Error activating user:', error);
            alert('Failed to activate user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
        try {
            await customerAPI.deleteCustomer(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const navItems = [
    { label: "Overview" },
    { label: "Users" },
    { label: "Suppliers" },
    { label: "Orders" },
    { label: "Payments" },
    { label: "Reviews" },
];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-name" style={{ fontFamily: "'NORD', sans-serif", fontWeight: 700, letterSpacing: '0.12em' }}>ANYWEAR</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            className={`nav-item ${activeNav === item.label ? 'nav-item--active' : ''}`}
                            onClick={() => handleNavClick(item.label)}
                            style={{ fontFamily: "'Grift', sans-serif" }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <h1 className="topbar-title">Admin Dashboard</h1>
                    <div className="topbar-user" style={{ position: 'relative' }}>
                        <button
                            className="user-menu-button"
                            onClick={() => setShowUserMenu(prev => !prev)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        >
                            <div className="user-avatar">{(adminUsername || 'A')[0].toUpperCase()}</div>
                            <div className="user-info">
                                <span className="user-name">{adminUsername}</span>
                                <span className="user-role">admin</span>
                            </div>
                        </button>
                        {showUserMenu && (
                            <div className="user-dropdown" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', borderRadius: '8px', zIndex: 20, minWidth: '150px', border: '1px solid #e5e5e5' }}>
                                <button onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px 14px', textAlign: 'left', cursor: 'pointer' }}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="admin-content">
                    <div className="section-header">
                        <h2 className="section-title">Customer Management</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                            Manage registered customers. New customers register through the signup page.
                        </p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <p className="stat-label">Total Customers</p>
                            <p className="stat-value">{totalUsers}</p>
                        </div>
                        <div className="stat-card stat-card--active">
                            <p className="stat-label stat-label--active">Active Customers</p>
                            <p className="stat-value">{activeUsers}</p>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                            <p className="stat-label" style={{ color: '#f59e0b' }}>Deactivated</p>
                            <p className="stat-value">{deactivatedUsers}</p>
                        </div>
                    </div>

                    <div className="table-section">
                        <h3 className="table-title">Registered Customers</h3>
                        <div className="table-card">
                            <div className="table-header">
                                <div>
                                    <p className="table-card-title">Customer list</p>
                                    <p className="table-card-sub">A list of all registered customers</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="search-box">
                                        <input
                                            className="search-input"
                                            placeholder="Search customers"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            style={{ width: '180px' }}
                                        />
                                    </div>
                                    <button onClick={fetchUsers} className="action-btn action-btn-view">Refresh</button>
                                </div>
                            </div>
                            {error && (
                                <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '10px' }}>
                                    {error}
                                </div>
                            )}
                            <table className="supplier-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No customers found</td></tr>
                                    ) : (
                                        filtered.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>{u.firstName} {u.lastName}</td>
                                                <td>{u.username}</td>
                                                <td>{u.email}</td>
                                                <td>{u.phoneNumber}</td>
                                                <td>{u.address}</td>
                                                <td>
                                                    <span className={`status-badge status-badge--${(u.status || '').toLowerCase()}`}>
                                                        {u.status === 'Active' && '✔ '}
                                                        {u.status === 'Deactivated' && '⊗ '}
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-group">
                                                        <button onClick={() => handleViewUser(u)} className="action-btn action-btn-view">View</button>
                                                        <button onClick={() => handleEditUser(u)} className="action-btn action-btn-edit">Edit</button>
                                                    </div>
                                                    <div className="action-group action-group-secondary">
                                                        {u.status === 'Active' && (
                                                            <button onClick={() => handleDeactivateUser(u.id)} className="action-btn action-btn-deactivate">Deactivate</button>
                                                        )}
                                                        {u.status === 'Deactivated' && (
                                                            <button onClick={() => handleActivateUser(u.id)} className="action-btn action-btn-activate">Activate</button>
                                                        )}
                                                        <button onClick={() => handleDeleteUser(u.id)} className="action-btn action-btn-delete">Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {showViewModal && viewUser && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Customer Details</h2>
                        <div className="view-grid">
                            <p><strong>ID:</strong> {viewUser.id}</p>
                            <p><strong>First Name:</strong> {viewUser.firstName}</p>
                            <p><strong>Last Name:</strong> {viewUser.lastName}</p>
                            <p><strong>Username:</strong> {viewUser.username}</p>
                            <p><strong>Email:</strong> {viewUser.email}</p>
                            <p><strong>Phone:</strong> {viewUser.phoneNumber}</p>
                            <p><strong>Address:</strong> {viewUser.address}</p>
                            <p><strong>Status:</strong> {viewUser.status}</p>
                            <p><strong>Registered:</strong> {viewUser.date}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editUser && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Edit Customer</h2>
                        {[
                            { key: 'firstName', label: 'First Name' },
                            { key: 'lastName', label: 'Last Name' },
                            { key: 'email', label: 'Email' },
                            { key: 'phoneNumber', label: 'Phone Number' },
                            { key: 'address', label: 'Address' },
                        ].map(field => (
                            <div className="modal-field" key={field.key}>
                                <label className="modal-label">{field.label}</label>
                                <input
                                    className="modal-input"
                                    value={editUser[field.key] || ''}
                                    onChange={e => setEditUser({ ...editUser, [field.key]: e.target.value })}
                                />
                            </div>
                        ))}
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="btn-add" onClick={handleUpdateUser}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
