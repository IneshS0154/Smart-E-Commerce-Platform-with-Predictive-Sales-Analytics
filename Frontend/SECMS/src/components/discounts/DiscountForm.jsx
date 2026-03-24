import { useState, useEffect } from "react";
import "./DiscountForm.css";

const DiscountForm = ({ onAdd, onEdit, editDiscount, onCancelEdit }) => {
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    value: "",
    category: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Load edit data when editDiscount prop changes
  useEffect(() => {
    if (editDiscount) {
      setForm({
        code: editDiscount.code || "",
        discount_type: editDiscount.discount_type || "percentage",
        value: editDiscount.value || "",
        category: editDiscount.category || "",
        start_date: editDiscount.start_date || "",
        end_date: editDiscount.end_date || "",
        usage_limit: editDiscount.usage_limit || "",
        status: editDiscount.status || "active",
      });
    } else {
      // Reset form when not in edit mode
      setForm({
        code: "",
        discount_type: "percentage",
        value: "",
        category: "",
        start_date: "",
        end_date: "",
        usage_limit: "",
        status: "active",
      });
    }
  }, [editDiscount]);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Code validation
    if (!form.code.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (form.code.length < 3) {
      newErrors.code = "Code must be at least 3 characters";
    }

    // Discount value validation
    if (!form.value) {
      newErrors.value = "Discount value is required";
    } else {
      const value = parseFloat(form.value);
      if (isNaN(value) || value < 0) {
        newErrors.value = "Please enter a valid positive number";
      }
      if (form.discount_type === "percentage" && value > 100) {
        newErrors.value = "Percentage cannot exceed 100%";
      }
    }

    // Date validation
    if (!form.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!form.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      newErrors.end_date = "End date must be after start date";
    }

    // Usage limit validation
    if (form.usage_limit) {
      const limit = parseInt(form.usage_limit);
      if (isNaN(limit) || limit < 1) {
        newErrors.usage_limit = "Please enter a valid positive number";
      }
    }

    // Category validation
    if (!form.category.trim()) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update form validity on form change
  useEffect(() => {
    setIsFormValid(validateForm());
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "code" ? value.toUpperCase() : value,
    });

    // Mark field as touched
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const submit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const allTouched = {};
      Object.keys(form).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    const formattedForm = {
      ...form,
      value: parseFloat(form.value),
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
    };

    if (editDiscount) {
      // If editing, call onEdit with updated data
      onEdit({ ...editDiscount, ...formattedForm });
      onCancelEdit(); // Exit edit mode
    } else {
      // If creating, call onAdd with new data
      onAdd(formattedForm);
    }
    
    // Reset form only if not in edit mode
    if (!editDiscount) {
      setForm({
        code: "",
        discount_type: "percentage",
        value: "",
        category: "",
        start_date: "",
        end_date: "",
        usage_limit: "",
        status: "active",
      });
      setTouched({});
      setErrors({});
    }
  };

  const handleCancel = () => {
    if (editDiscount && onCancelEdit) {
      onCancelEdit();
    }
    // Reset form
    setForm({
      code: "",
      discount_type: "percentage",
      value: "",
      category: "",
      start_date: "",
      end_date: "",
      usage_limit: "",
      status: "active",
    });
    setTouched({});
    setErrors({});
  };

  // Get input class based on field state
  const getInputClass = (fieldName) => {
    let className = "discount-form-input";
    if (fieldName === "code") {
      className += " uppercase";
    }
    if (errors[fieldName] && touched[fieldName]) {
      className += " error";
    }
    return className;
  };

  // Get select class based on field state
  const getSelectClass = (fieldName) => {
    let className = "discount-form-select";
    if (errors[fieldName] && touched[fieldName]) {
      className += " error";
    }
    return className;
  };

  return (
    <div className="discount-form-container">
      <div className="discount-form-card">
        <div className="discount-form-header">
          <h2 className="discount-form-title">
            {editDiscount ? "Edit Discount" : "Create New Promotion"}
          </h2>
          <p className="discount-form-subtitle">
            {editDiscount ? "Update your discount details" : "Design your perfect discount campaign"}
          </p>
          {editDiscount && (
            <div className="edit-notice">
              <span className="edit-notice-badge">Editing: {editDiscount.code}</span>
            </div>
          )}
        </div>

        <form onSubmit={submit}>
          <div className="discount-form-grid">
            {/* Coupon Code */}
            <div className="discount-form-group">
              <label className="discount-form-label">
                Coupon Code <span className="discount-form-required">*</span>
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., SUMMER25"
                className={getInputClass('code')}
                disabled={!!editDiscount} // Disable code editing for existing discounts
              />
              {errors.code && touched.code && (
                <p className="discount-form-error">{errors.code}</p>
              )}
              {editDiscount && (
                <p className="discount-form-helper">Coupon code cannot be changed</p>
              )}
            </div>

            {/* Discount Type */}
            <div className="discount-form-group">
              <label className="discount-form-label">
                Discount Type <span className="discount-form-required">*</span>
              </label>
              <select
                name="discount_type"
                value={form.discount_type}
                onChange={handleChange}
                onBlur={handleBlur}
                className="discount-form-select"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount</option>
                <option value="seasonal">Seasonal</option>
                <option value="bogo">Buy One Get One</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="discount-form-group">
              <label className="discount-form-label">
                Discount Value <span className="discount-form-required">*</span>
                {form.discount_type === "percentage" && " (%)"}
                {form.discount_type === "flat" && " ($)"}
              </label>
              <input
                name="value"
                type="number"
                step="0.01"
                value={form.value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={form.discount_type === "percentage" ? "e.g., 25" : "e.g., 10.00"}
                className={getInputClass('value')}
              />
              {errors.value && touched.value && (
                <p className="discount-form-error">{errors.value}</p>
              )}
            </div>

            {/* Category */}
            <div className="discount-form-group">
              <label className="discount-form-label">
                Category <span className="discount-form-required">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getSelectClass('category')}
              >
                <option value="">Select a category</option>
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Dresses">Dresses</option>
                <option value="Sportswear">Sportswear</option>
                <option value="Undergarments">Undergarments</option>
                <option value="Footwear and Accessories">Footwear and Accessories</option>
                <option value="all">All Products</option>
              </select>
              {errors.category && touched.category && (
                <p className="discount-form-error">{errors.category}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="discount-form-group">
              <label className="discount-form-label">
                Start Date <span className="discount-form-required">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('start_date')}
              />
              {errors.start_date && touched.start_date && (
                <p className="discount-form-error">{errors.start_date}</p>
              )}
            </div>

            {/* End Date */}
            <div className="discount-form-group">
              <label className="discount-form-label">
                End Date <span className="discount-form-required">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('end_date')}
              />
              {errors.end_date && touched.end_date && (
                <p className="discount-form-error">{errors.end_date}</p>
              )}
            </div>

            {/* Usage Limit */}
            <div className="discount-form-group">
              <label className="discount-form-label">Usage Limit (Optional)</label>
              <input
                name="usage_limit"
                type="number"
                value={form.usage_limit}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 100"
                min="1"
                className={getInputClass('usage_limit')}
              />
              {errors.usage_limit && touched.usage_limit && (
                <p className="discount-form-error">{errors.usage_limit}</p>
              )}
              <p className="discount-form-helper">Leave empty for unlimited usage</p>
            </div>

            {/* Status */}
            <div className="discount-form-group">
              <label className="discount-form-label">
                Status <span className="discount-form-required">*</span>
              </label>
              <div className="discount-form-radio-group">
                <label className="discount-form-radio-label">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={form.status === "active"}
                    onChange={handleChange}
                    className="discount-form-radio-input"
                  />
                  Active
                </label>
                <label className="discount-form-radio-label">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={form.status === "inactive"}
                    onChange={handleChange}
                    className="discount-form-radio-input"
                  />
                  Inactive
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            {editDiscount ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="form-btn cancel-btn"
                >
                  Cancel Edit
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="form-btn update-btn"
                >
                  <svg 
                    className="form-btn-icon" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  Update Discount
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={!isFormValid}
                className="form-btn submit-btn"
              >
                <svg 
                  className="form-btn-icon" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
                Create Discount
              </button>
            )}
            
            {!isFormValid && Object.keys(touched).length > 0 && (
              <p className="form-warning">
                Please fix all errors before {editDiscount ? "updating" : "submitting"}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountForm;