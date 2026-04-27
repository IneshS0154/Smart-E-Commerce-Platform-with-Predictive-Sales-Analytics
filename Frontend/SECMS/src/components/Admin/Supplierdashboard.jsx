import { useState, useEffect, useMemo } from 'react';
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from 'react-router-dom';
import sellerAPI from '../../api/sellerAPI';
import orderAPI from '../../api/orderAPI';
import { 
    Search as SearchIcon, Plus, Eye, Edit2, Trash2, X, 
    ChevronDown, Store, Mail, Phone, MapPin, Download,
    Filter, Activity, Briefcase, UserMinus, CheckCircle,
    ShieldAlert, AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../common/ConfirmModal';
import './Supplierdashboard.css';
import DarkVeil from '../ui/DarkVeil';

const fmtPrice = (p) => p ? `LKR ${parseFloat(p).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'LKR 0.00';

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

const ViewSupplierModal = ({ supplier, onClose }) => {
    if (!supplier) return null;
    const isSuspended = supplier.deactivated || supplier.status === 'DEACTIVATED';
    return (
        <ModalWrapper title="Partner Profile" onClose={onClose}>
            <div className="profile-view-grid">
                <div className="profile-avatar-large">
                    <Store size={32} />
                </div>
                <div className="profile-main-info">
                    <h3>{supplier.storeName}</h3>
                    <p>@{supplier.username}</p>
                    <span className={`status-badge ${isSuspended ? 'off' : 'on'}`}>
                        {isSuspended ? 'Suspended' : 'Official Partner'}
                    </span>
                </div>
            </div>
            
            <div className="profile-details-section">
                <div className="detail-item">
                    <Mail size={16} />
                    <div>
                        <label>Business Email</label>
                        <p>{supplier.email}</p>
                    </div>
                </div>
                <div className="detail-item">
                    <Phone size={16} />
                    <div>
                        <label>Support Contact</label>
                        <p>{supplier.phoneNumber || 'Not provided'}</p>
                    </div>
                </div>
                <div className="detail-item">
                    <MapPin size={16} />
                    <div>
                        <label>Headquarters</label>
                        <p>{supplier.address || 'Anywear Global Network'}</p>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

const SupplierFormFields = ({ data, setData }) => (
    <div className="form-grid-2">
        <div className="modal-form-group">
            <label className="modal-label">Store Name</label>
            <input type="text" className="modal-input" value={data.storeName || ''} onChange={e => setData({...data, storeName: e.target.value})} required />
        </div>
        <div className="modal-form-group">
            <label className="modal-label">Username</label>
            <input type="text" className="modal-input" value={data.username || ''} onChange={e => setData({...data, username: e.target.value})} required />
        </div>
        <div className="modal-form-group">
            <label className="modal-label">Email</label>
            <input type="email" className="modal-input" value={data.email || ''} onChange={e => setData({...data, email: e.target.value})} required />
        </div>
        <div className="modal-form-group">
            <label className="modal-label">Phone</label>
            <input type="text" className="modal-input" value={data.phoneNumber || ''} onChange={e => setData({...data, phoneNumber: e.target.value})} />
        </div>
        <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label className="modal-label">Business Address</label>
            <input type="text" className="modal-input" value={data.address || ''} onChange={e => setData({...data, address: e.target.value})} />
        </div>
        {!data.id && (
            <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label className="modal-label">Password</label>
                <input type="password" className="modal-input" value={data.password || ''} onChange={e => setData({...data, password: e.target.value})} required />
            </div>
        )}
    </div>
);

export default function Supplierdashboard({ activeNav: activeNavProp, onNavChange, showSidebar = true }) {
    const navigate = useNavigate();
    const toast = useToast();
    const [activeNav, setActiveNav] = useState(activeNavProp ?? 'Suppliers');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    
    // UI State
    const [suppliers, setSuppliers] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    // Form State
    const [supplierForm, setSupplierForm] = useState({
        storeName: '', username: '', email: '', 
        phoneNumber: '', address: '', password: ''
    });

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const [sellerData, orderData] = await Promise.all([
                sellerAPI.getAllSellers(),
                orderAPI.getAllOrders()
            ]);
            
            const sellersList = Array.isArray(sellerData) ? sellerData : (sellerData?.sellers || sellerData?.data || []);
            setSuppliers(sellersList);
            setAllOrders(orderData || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    const supplierRevenueMap = useMemo(() => {
        const map = {};
        allOrders.forEach(order => {
            order.orderItems?.forEach(item => {
                const sId = item.product?.seller?.id;
                if (sId) {
                    map[sId] = (map[sId] || 0) + (parseFloat(item.subtotal) || 0);
                }
            });
        });
        return map;
    }, [allOrders]);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleToggleStatus = async (sup) => {
        const isCurrentlySuspended = sup.deactivated || sup.status === 'DEACTIVATED';
        const action = isCurrentlySuspended ? 'activate' : 'deactivate';
        
        try {
            if (isCurrentlySuspended) {
                await sellerAPI.activateSeller(sup.id);
                toast.success('Partner Restored', `${sup.storeName} is now active.`);
            } else {
                await sellerAPI.deactivateSeller(sup.id);
                toast.info('Partner Suspended', `${sup.storeName} has been restricted.`);
            }
            setTimeout(() => fetchSuppliers(), 300);
        } catch (err) {
            console.error(`Error ${action}ing supplier:`, err);
            toast.error('Sync Error', 'Failed to update partner operational status.');
        }
    };

    const handleDeleteSupplier = async () => {
        if (!pendingDeleteId) return;
        try {
            await sellerAPI.deleteSeller(pendingDeleteId);
            setSuppliers(prev => prev.filter(s => s.id !== pendingDeleteId));
            toast.success('Partner Wiped', 'All partner data has been removed.');
        } catch (err) {
            console.error('Error deleting supplier:', err);
            toast.error('Deletion Failed', 'System error during account removal.');
        } finally {
            setPendingDeleteId(null);
        }
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try {
            await sellerAPI.registerSeller(supplierForm);
            setShowAddModal(false);
            setSupplierForm({ storeName: '', username: '', email: '', phoneNumber: '', address: '', password: '' });
            fetchSuppliers();
            toast.success('Partner Registered', 'Supplier account is now live.');
        } catch (err) {
            console.error('Error adding supplier:', err);
            toast.error('Registration Failed', 'Email or Username may already be in use.');
        }
    };

    const handleEditSupplier = async (e) => {
        e.preventDefault();
        try {
            await sellerAPI.updateSeller(selectedSupplier.id, selectedSupplier);
            setShowEditModal(false);
            fetchSuppliers();
            toast.success('Profile Saved', 'Partner details updated successfully.');
        } catch (err) {
            console.error('Error updating supplier:', err);
            toast.error('Update Failed', 'Partner record could not be saved.');
        }
    };

    const filteredSuppliers = suppliers.filter(sup => {
        const isSuspended = sup.deactivated || sup.status === 'DEACTIVATED';
        const matchesSearch = !search || 
            `${sup.storeName} ${sup.email} ${sup.username}`.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All Statuses' || 
            (statusFilter === 'Active' && !isSuspended) || 
            (statusFilter === 'Deactivated' && isSuspended);
        return matchesSearch && matchesStatus;
    });

    const handleNavClick = (nav) => {
        setActiveNav(nav);
        if (onNavChange) onNavChange(nav);
    };

    const handleLogout = () => {
        localStorage.removeItem("admin");
        navigate('/');
    };

    const renderContent = () => (
        <div className="admin-vault-content">
            <div className="vault-header">
                <div className="vault-header-left">
                    <h1 className="vault-title-main">Suppliers</h1>
                    <p className="ov-text-subtitle">Manage platform partners, approval workflows, and operational status.</p>
                </div>
                <button className="vault-btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={18} />
                    <span>Add Partner</span>
                </button>
            </div>

            <div className="vault-filters-bar">
                <div className="vault-search-wrapper">
                    <SearchIcon size={18} className="vault-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by store name, email or handle..." 
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
                                <th>PARTNER</th>
                                <th>HANDLE</th>
                                <th>JOINED</th>
                                <th>REVENUE</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="table-loading">Syncing records...</td></tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr><td colSpan="6" className="table-empty">No partners found</td></tr>
                            ) : (
                                filteredSuppliers.map((sup) => {
                                    const isSuspended = sup.deactivated || sup.status === 'DEACTIVATED';
                                    return (
                                        <tr key={sup.id}>
                                            <td>
                                                <div className="vault-user-cell">
                                                    <div className="user-avatar">
                                                        <Store size={18} />
                                                    </div>
                                                    <div className="user-info">
                                                        <span className="user-name">{sup.storeName || 'Unnamed Store'}</span>
                                                        <span className="user-handle">{sup.email || 'No email'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="handle-badge">@{sup.username || 'n/a'}</span>
                                            </td>
                                            <td>
                                                <span className="date-cell">
                                                    {(sup.createdAt || sup.createdDate || sup.dateJoined) ? 
                                                        new Date(sup.createdAt || sup.createdDate || sup.dateJoined).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                                        : 'Jan 2024'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="revenue-cell" style={{ fontWeight: 700 }}>
                                                    {fmtPrice(supplierRevenueMap[sup.id] || 0)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`ov-status-dot ${isSuspended ? 'ov-status-dot--deactivated' : 'ov-status-dot--active'}`}>
                                                    {isSuspended ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="vault-action-group">
                                                    <button className="vault-action-icon" title="View Details" onClick={() => { setSelectedSupplier(sup); setShowViewModal(true); }}>
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className={`vault-action-icon ${isSuspended ? 'activate' : 'deactivate'}`} title={isSuspended ? "Restore Partner" : "Suspend Partner"} onClick={() => handleToggleStatus(sup)}>
                                                        {isSuspended ? <CheckCircle size={18} /> : <UserMinus size={18} />}
                                                    </button>
                                                    <button className="vault-action-icon" title="Edit Partner" onClick={() => { setSelectedSupplier(sup); setShowEditModal(true); }}>
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button className="vault-action-icon delete" title="Wipe Account" onClick={() => setPendingDeleteId(sup.id)}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showViewModal && <ViewSupplierModal supplier={selectedSupplier} onClose={() => setShowViewModal(false)} />}
            
            {showAddModal && (
                <ModalWrapper title="Register Partner" onClose={() => setShowAddModal(false)} footer={
                    <>
                        <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button className="btn-primary" onClick={handleAddSupplier}>Register Supplier</button>
                    </>
                }>
                    <SupplierFormFields data={supplierForm} setData={setSupplierForm} />
                </ModalWrapper>
            )}

            {showEditModal && (
                <ModalWrapper title="Modify Partner" onClose={() => setShowEditModal(false)} footer={
                    <>
                        <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button className="btn-primary" onClick={handleEditSupplier}>Save Changes</button>
                    </>
                }>
                    <SupplierFormFields data={selectedSupplier} setData={setSelectedSupplier} />
                </ModalWrapper>
            )}

            <ConfirmModal 
                isOpen={!!pendingDeleteId}
                title="Wipe Partner Data"
                message="Are you absolutely sure? Deleting this partner will permanently remove all their products, orders, and sales data from the Vault."
                confirmText="Wipe Account"
                onConfirm={handleDeleteSupplier}
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
