import { useState, useEffect } from 'react';
import './EditDiscountForm.css';

const EditDiscountForm = ({ discount, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    value: '',
    discount_type: 'percentage',
    category: '',
    start_date: '',
    end_date: '',
    usage_limit: '',
    status: 'active'
  });

  // Load discount data when component mounts
  useEffect(() => {
    if (discount) {
      setFormData({
        value: discount.value || '',
        discount_type: discount.discount_type || 'percentage',
        category: discount.category || '',
        start_date: discount.start_date || '',
        end_date: discount.end_date || '',
        usage_limit: discount.usage_limit || '',
        status: discount.status || 'active'
      });
    }
  }, [discount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.value || !formData.category || !formData.start_date || !formData.end_date) {
      alert('Please fill all required fields');
      return;
    }

    // Validate date range
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      alert('End date must be after start date');
      return;
    }

    // Validate percentage discount
    if (formData.discount_type === 'percentage' && formData.value > 100) {
      alert('Percentage cannot exceed 100%');
      return;
    }

    // Prepare updated discount
    const updatedDiscount = {
      ...discount,
      ...formData,
      value: parseFloat(formData.value),
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
    };

    onSave(updatedDiscount);
  };

  if (!discount) return null;

  return (
    <div className="edit-discount-modal">
      <div className="edit-discount-content">
        <div className="edit-header">
          <h2>Edit Discount</h2>
          <span className="discount-code-badge">{discount.code}</span>
          <p className="edit-subtitle">Update discount details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="edit-form-grid">
            {/* Discount Value */}
            <div className="form-group">
              <label>
                Discount Value *
                {formData.discount_type === 'percentage' && ' (%)'}
                {formData.discount_type === 'flat' && ' ($)'}
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                step="0.01"
                min="0"
                max={formData.discount_type === 'percentage' ? '100' : ''}
                required
              />
            </div>

            {/* Discount Type */}
            <div className="form-group">
              <label>Discount Type *</label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="beauty">Beauty</option>
                <option value="all">All Products</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* End Date */}
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Usage Limit */}
            <div className="form-group">
              <label>Usage Limit (Optional)</label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleChange}
                min="1"
                placeholder="Leave empty for unlimited"
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status *</label>
              <div className="status-options">
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleChange}
                  />
                  Active
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={handleChange}
                  />
                  Inactive
                </label>
              </div>
            </div>
          </div>

          <div className="edit-form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDiscountForm;