import { useState, useEffect } from 'react';
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from 'react-router-dom';
import customerAPI from '../../api/customerAPI';
import authService from '../../api/authService';
import { 
    Search as SearchIcon, Plus,
    Eye, Edit2, UserMinus, Trash2, X,
    CheckCircle, User, Mail, Phone, MapPin, 
    ChevronDown, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../common/ConfirmModal';
import './Userdashboard.css';
import DarkVeil from '../ui/DarkVeil';

// ── MOVE COMPONENTS OUTSIDE TO PREVENT RE-RENDER FLICKER ──

const ModalWrapper = ({ children, title, onClose, footer }) => (
    <div className="vault-modal-overlay" onClick={onClose}>
        <div className="vault-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <div>
                    <h2 className="modal-title">{title}</h2>
                    <div className="modal-title-line"></div>
                </div>
                <button className="modal-close" onClick={onClose}><X size={20} /></button>
            </div>
            <div className="modal-body">
                {children}
            </div>
            {footer && <div className="modal-footer">{footer}</div>}
        </div>
    </div>
);

const ViewUserModal = ({ user, onClose }) => {
    if (!user) return null;
    return (
        <ModalWrapper title="User Profile" onClose={onClose}>
            <div className="profile-view-grid">
                <div className="profile-avatar-large">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="profile-main-info">
                    <h3>{user.firstName} {user.lastName}</h3>
                    <p>@{user.username}</p>
                    <span className={`status-badge ${user.deactivated ? 'off' : 'on'}`}>
                        {user.deactivated ? 'Suspended' : 'Verified Partner'}
                    </span>
                </div>
            </div>
            
            <div className="profile-details-section">
                <div className="detail-item">
                    <Mail size={16} />
                    <div>
                        <label>Email Address</label>
                        <p>{user.email}</p>
                    </div>
                </div>
                <div className="detail-item">
                    <Phone size={16} />
                    <div>
                        <label>Phone Number</label>
                        <p>{user.phoneNumber || 'Not provided'}</p>
                    </div>
                </div>
                <div className="detail-item">
                    <MapPin size={16} />
                    <div>
                        <label>Region</label>
                        <p>Anywear Global</p>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

const UserFormFields = ({ data, setData }) => (
    <div className="form-grid-2">
        <div className="modal-form-group">
            <label className="modal-label">First Name</label>
            <input type="text" className="modal-input" value={data.firstName || ''} onChange={e => setData({...data, firstName: e.target.value})} required />
        </div>
        <div className="modal-form-group">
            <label className="modal-label">Last Name</label>
            <input type="text" className="modal-input" value={data.lastName || ''} onChange={e => setData({...data, lastName: e.target.value})} required />
        </div>
        <div className="modal-form-group">
            <label className="modal-label">Email</label>
            <input type="email" className="modal-input" value={data.email || ''} onChange={e => setData({...data, email: e.target.value})} required />
        </div>
        <div className="modal-form-group">
            <label className="modal-label">Username</label>
            <input type="text" className="modal-input" value={data.username || ''} onChange={e => setData({...data, username: e.target.value})} required />
        </div>
        <div className="modal-form-group">
            <label className="modal-label">Phone</label>
            <input type="text" className="modal-input" value={data.phoneNumber || ''} onChange={e => setData({...data, phoneNumber: e.target.value})} />
        </div>
        {!data.id && (
            <div className="modal-form-group">
                <label className="modal-label">Temp Password</label>
                <input type="password" className="modal-input" value={data.password || ''} onChange={e => setData({...data, password: e.target.value})} required />
            </div>
        )}
    </div>
);

export default function Userdashboard({ activeNav: activeNavProp, onNavChange, showSidebar = true }) {
    const navigate = useNavigate();
    const toast = useToast();
    const [activeNav, setActiveNav] = useState(activeNavProp ?? 'Users');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    
    // UI State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    // Form State
    const [userForm, setUserForm] = useState({
        firstName: '', lastName: '', email: '', 
        username: '', phoneNumber: '', password: ''
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await customerAPI.getAllCustomers();
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async () => {
        if (!pendingDeleteId) return;
        try {
            await customerAPI.deleteCustomer(pendingDeleteId);
            setUsers(prev => prev.filter(u => u.id !== pendingDeleteId));
            toast.success('User Deleted', 'Account has been permanently removed.');
        } catch (err) {
            console.error('Error deleting user:', err);
            toast.error('Deletion Failed', 'System was unable to wipe the account.');
        } finally {
            setPendingDeleteId(null);
        }
    };

    const handleToggleStatus = async (user) => {
        const action = user.deactivated ? 'activate' : 'deactivate';
        try {
            if (user.deactivated) {
                await customerAPI.activateCustomer(user.id);
                toast.success('Account Restored', 'The user can now access their account.');
            } else {
                await customerAPI.deactivateCustomer(user.id);
                toast.info('Account Suspended', 'The user has been restricted from the platform.');
            }
            fetchUsers();
        } catch (err) {
            console.error(`Error ${action}ing user:`, err);
            toast.error('Action Failed', 'Backend synchronization failed.');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await authService.register(userForm);
            setShowAddModal(false);
            setUserForm({ firstName: '', lastName: '', email: '', username: '', phoneNumber: '', password: '' });
            fetchUsers();
            toast.success('Account Created', 'New user has been successfully registered.');
        } catch (err) {
            console.error('Error adding user:', err);
            toast.error('Registration Failed', 'Email or Username may already be in use.');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            await customerAPI.updateCustomer(selectedUser.id, selectedUser);
            setShowEditModal(false);
            fetchUsers();
            toast.success('Profile Updated', 'User records have been synchronized.');
        } catch (err) {
            console.error('Error updating user:', err);
            toast.error('Update Failed', 'Changes could not be saved.');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = !search || 
            `${user.firstName} ${user.lastName} ${user.email} ${user.username}`.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All Statuses' || 
            (statusFilter === 'Active' && !user.deactivated) || 
            (statusFilter === 'Deactivated' && user.deactivated);
        return matchesSearch && matchesStatus;
    });

    const handleNavClick = (nav) => {
        setActiveNav(nav);
        if (onNavChange) onNavChange(nav);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const renderContent = () => (
        <div className="admin-vault-content">
            <div className="vault-header">
                <div className="vault-header-left">
                    <h1 className="vault-title-main">Users</h1>
                    <p className="ov-text-subtitle">Platform-wide customer management and verification.</p>
                </div>
                <button className="vault-btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    <span>Create Account</span>
                </button>
            </div>

            <div className="vault-filters-bar">
                <div className="vault-search-wrapper">
                    <SearchIcon size={18} className="vault-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or handle..." 
                        className="vault-search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="vault-select-wrapper">
                    <ChevronDown size={14} className="select-arrow" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="vault-select-clean">
                        <option>All Statuses</option>
                        <option>Active</option>
                        <option>Deactivated</option>
                    </select>
                </div>
            </div>

            <div className="vault-table-card">
                <div className="vault-table-container">
                    <table className="vault-table">
                        <thead>
                            <tr>
                                <th>USER</th>
                                <th>CONTACT</th>
                                <th>JOINED</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="table-loading">Syncing records...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="table-empty">No matching users found</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="vault-user-cell">
                                                <div className="user-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                                                <div className="user-info">
                                                    <span className="user-name">{user.firstName} {user.lastName}</span>
                                                    <span className="user-handle">@{user.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="vault-contact-cell">
                                                <span className="email">{user.email}</span>
                                                <span className="phone">{user.phoneNumber || '--'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="date-cell">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`ov-status-dot ${user.deactivated ? 'ov-status-dot--deactivated' : 'ov-status-dot--active'}`}>
                                                {user.deactivated ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="vault-action-group">
                                                <button className="vault-action-icon" title="View Details" onClick={() => { setSelectedUser(user); setShowViewModal(true); }}>
                                                    <Eye size={18} />
                                                </button>
                                                <button className="vault-action-icon" title="Edit Profile" onClick={() => { setSelectedUser(user); setShowEditModal(true); }}>
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="vault-action-icon delete" title="Wipe Account" onClick={() => setPendingDeleteId(user.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals - Components now outside so they don't remount on state change */}
            {showViewModal && <ViewUserModal user={selectedUser} onClose={() => setShowViewModal(false)} />}
            
            {showAddModal && (
                <ModalWrapper title="Create New Account" onClose={() => setShowAddModal(false)} footer={
                    <>
                        <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button className="btn-primary" onClick={handleAddUser}>Create User</button>
                    </>
                }>
                    <UserFormFields data={userForm} setData={setUserForm} />
                </ModalWrapper>
            )}

            {showEditModal && (
                <ModalWrapper title="Modify Profile" onClose={() => setShowEditModal(false)} footer={
                    <>
                        <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button className="btn-primary" onClick={handleEditUser}>Save Changes</button>
                    </>
                }>
                    <UserFormFields data={selectedUser} setData={setSelectedUser} />
                </ModalWrapper>
            )}

            <ConfirmModal 
                isOpen={!!pendingDeleteId}
                title="Permanent Wiping"
                message="Are you absolutely sure? This will permanently remove this user and all associated records from the Vault."
                confirmText="Wipe Account"
                onConfirm={handleDeleteUser}
                onCancel={() => setPendingDeleteId(null)}
            />
        </div>
    );

    if (!showSidebar) return renderContent();

    return (
        <div className="admin-vault-frame">
            <div className="auth-bg-wrapper">
                <DarkVeil 
                    speed={0.6} 
                    noiseIntensity={0.01} 
                    scanlineIntensity={0.05} 
                    warpAmount={0.1}
                    grayscale={1.0}
                />
            </div>
            <AdminSidebar activeNav={activeNav} setActiveNav={handleNavClick} handleLogout={handleLogout} />
            <main className="admin-vault-main">
                <div key={activeNav} className="vault-page-transition">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
