import { useState } from "react";
import DiscountForm from "../components/discounts/DiscountForm";
import DiscountTable from "../components/discounts/DiscountTable";
import "./DiscountManagement.css";
import EditDiscountForm from "../components/discounts/EditDiscountForm";

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [editingDiscount, setEditingDiscount] = useState(null);

  // Filter discounts based on active tab
  const activeDiscounts = discounts.filter(d => d.status === 'active');
  const inactiveDiscounts = discounts.filter(d => d.status === 'inactive');
  const totalDiscounts = discounts.length;

  // Handle discount deletion
  const handleDeleteDiscount = (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      setDiscounts(discounts.filter(discount => discount.id !== id));
    }
  };

  // Handle discount status toggle
  const handleToggleStatus = (id) => {
    setDiscounts(discounts.map(discount => 
      discount.id === id 
        ? { ...discount, status: discount.status === 'active' ? 'inactive' : 'active' }
        : discount
    ));
  };

  // Calculate discount value display
  const getDiscountValue = (discount) => {
    if (discount.discount_type === 'percentage') {
      return `${discount.value}%`;
    } else if (discount.discount_type === 'flat') {
      return `$${discount.value}`;
    } else if (discount.discount_type === 'bogo') {
      return 'Buy 1 Get 1';
    } else {
      return 'Seasonal';
    }
  };
  // Start editing a discount
  const handleEditClick = (discount) => {
    setEditingDiscount(discount);
  };

  // Save edited discount
  const handleSaveEdit = (updatedDiscount) => {
    setDiscounts(discounts.map(d => 
      d.id === updatedDiscount.id ? updatedDiscount : d
    ));
    setEditingDiscount(null);
    alert('Discount updated successfully!');
  };
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingDiscount(null);
  };

  return (
    <div className="discount-management-page">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>
        <div className="bg-circle-3"></div>
        <div className="bg-gradient-blob"></div>
      </div>

      <div className="page-header">
        <div className="header-content">
          <div className="title-wrapper">
            <h1 className="page-title">
              <span className="title-gradient">ANYWHERE</span><br></br> EVERYWHERE
            </h1>
            
          </div>
          <p className="page-subtitle">
            Create, manage, and track promotional campaigns 
          </p>
        </div>
        
        <div className="header-stats">
          <div className="stat-bubble total">
            <div className="stat-icon">🏷️</div>
            <div className="stat-content">
              <span className="stat-number">{totalDiscounts}</span>
              <span className="stat-label">Total Discounts</span>
            </div>
          </div>
          <div className="stat-bubble active">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <span className="stat-number">{activeDiscounts.length}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
          <div className="stat-bubble inactive">
            <div className="stat-icon">⏸️</div>
            <div className="stat-content">
              <span className="stat-number">{inactiveDiscounts.length}</span>
              <span className="stat-label">Inactive</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Create Discount Form Card */}
        <div className="form-container">
          <div className="form-card">
            <div className="card-header">
              <div className="header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15V3M12 15L8 11M12 15L16 11M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="card-title">Discount & Promotion Management</h2>
                <p className="card-subtitle">Manage discount policies and promotional campaigns</p>
              </div>
            </div>
            <DiscountForm 
              onAdd={(newDiscount) => {
                const discountWithId = {
                  ...newDiscount,
                  id: Date.now(),
                  created_at: new Date().toISOString().split('T')[0],
                  remaining_uses: newDiscount.usage_limit || '∞',
                  total_used: 0
                };
                setDiscounts([...discounts, discountWithId]);
              }} 
            />
          </div>
        </div>

        {/* Discounts Overview Section */}
        <div className="discounts-overview">
          <div className="tabs-header">
            <div className="tabs">
              <button 
                className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
                onClick={() => setActiveTab("active")}
              >
                <span className="tab-icon">🔥</span>
                Active Discounts
                <span className="tab-badge">{activeDiscounts.length}</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === "inactive" ? "active" : ""}`}
                onClick={() => setActiveTab("inactive")}
              >
                <span className="tab-icon">⏸️</span>
                Inactive
                <span className="tab-badge">{inactiveDiscounts.length}</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                <span className="tab-icon">📋</span>
                All Discounts
                <span className="tab-badge">{totalDiscounts}</span>
              </button>
            </div>
            <div className="view-toggle">
              <button className="view-btn active">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="view-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="10" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="16" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="discounts-grid">
            {(activeTab === "active" ? activeDiscounts : 
              activeTab === "inactive" ? inactiveDiscounts : discounts).length > 0 ? (
              (activeTab === "active" ? activeDiscounts : 
                activeTab === "inactive" ? inactiveDiscounts : discounts).map(discount => (
                <div key={discount.id} className="discount-card">
                  <div className="card-corner">
                    <div className={`corner-ribbon ${discount.status}`}>
                      {discount.status}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-header-row">
                      <div className="discount-code">
                        <span className="code-text">{discount.code}</span>
                        <span className="discount-type">{discount.discount_type}</span>
                      </div>
                      <div className="discount-value">
                        <span className="value-display">{getDiscountValue(discount)}</span>
                        <span className="value-label">OFF</span>
                      </div>
                    </div>

                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-icon">🏷️</span>
                        <div>
                          <span className="detail-label">Category</span>
                          <span className="detail-value capitalize">{discount.category}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <div>
                          <span className="detail-label">Valid Until</span>
                          <span className="detail-value">{discount.end_date}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">👥</span>
                        <div>
                          <span className="detail-label">Usage Limit</span>
                          <span className="detail-value">
                            {discount.usage_limit ? `${discount.usage_limit} uses` : 'Unlimited'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="progress-section">
                      <div className="progress-label">
                        <span>Usage Progress</span>
                        <span>0/{discount.usage_limit || '∞'}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '0%'}}></div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className={`action-btn status-btn ${discount.status}`}
                        onClick={() => handleToggleStatus(discount.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          {discount.status === 'active' ? (
                            <path d="M18 8L10 16L6 12" stroke="currentColor" strokeWidth="2" 
                                  strokeLinecap="round" strokeLinejoin="round"/>
                          ) : (
                            <path d="M6 12H18" stroke="currentColor" strokeWidth="2" 
                                  strokeLinecap="round" strokeLinejoin="round"/>
                          )}
                        </svg>
                        {discount.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteDiscount(discount.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M19 7L18.1327 19.142C18.0579 20.189 17.187 21 16.1378 21H7.86224C6.81302 21 5.94208 20.189 5.86732 19.142L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Delete
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditClick(discount)}
                       
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="40" fill="url(#empty-gradient)"/>
                    <path d="M30 40L35 45L50 30" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="empty-gradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#667eea"/>
                        <stop offset="1" stopColor="#764ba2"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="empty-state-title">No Discounts Found</h3>
                <p className="empty-state-description">
                  {activeTab === "active" 
                    ? "Create an active discount to get started!" 
                    : activeTab === "inactive"
                    ? "All discounts are currently active"
                    : "Create your first discount campaign"}
                </p>
                <button className="create-btn" onClick={() => document.querySelector('.form-card')?.scrollIntoView({behavior: 'smooth'})}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create First Discount
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Edit Form Modal */}
      {editingDiscount && (
        <EditDiscountForm
          discount={editingDiscount}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
  
};

export default DiscountManagement;