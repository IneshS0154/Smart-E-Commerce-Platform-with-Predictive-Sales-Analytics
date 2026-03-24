import React, { useState, useEffect } from 'react';
import './SmartDiscountEngine.css';

const SmartDiscountEngine = () => {
  const [discountRules, setDiscountRules] = useState([
    {
      id: 1,
      name: 'Slow Moving Inventory',
      description: 'Generate discounts for products with low sales velocity',
      active: true,
      minStockDays: 30,
      discountRange: { min: 15, max: 30 },
      category: 'all'
    },
    {
      id: 2,
      name: 'Seasonal Clearance',
      description: 'Clear seasonal items at the end of season',
      active: true,
      season: 'winter',
      discountRange: { min: 25, max: 50 },
      category: 'seasonal'
    },
    {
      id: 3,
      name: 'Bulk Purchase Incentive',
      description: 'Encourage larger purchases with volume discounts',
      active: true,
      minQuantity: 3,
      discountPerUnit: 5,
      maxDiscount: 25
    },
    {
      id: 4,
      name: 'Customer Loyalty Reward',
      description: 'Reward repeat customers with exclusive discounts',
      active: true,
      minPurchases: 5,
      discountAmount: 10,
      customerTier: 'gold'
    },
    {
      id: 5,
      name: 'Profit Margin Based',
      description: 'Auto-calculate discounts based on product profit margins',
      active: true,
      minMargin: 40,
      maxDiscountFromMargin: 20
    }
  ]);

  const [generatedDiscounts, setGeneratedDiscounts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenueIncrease: 0,
    inventoryReduction: 0,
    customerAcquisition: 0,
    avgDiscountValue: 0
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Simulate discount generation based on business rules
  const generateSmartDiscounts = () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const activeRules = discountRules.filter(rule => rule.active);
      const newDiscounts = activeRules.map(rule => {
        // Generate discount based on rule logic
        let discountValue;
        let discountType;
        
        switch(rule.name) {
          case 'Slow Moving Inventory':
            discountValue = Math.floor(Math.random() * (rule.discountRange.max - rule.discountRange.min + 1)) + rule.discountRange.min;
            discountType = 'percentage';
            break;
          case 'Seasonal Clearance':
            discountValue = Math.floor(Math.random() * (rule.discountRange.max - rule.discountRange.min + 1)) + rule.discountRange.min;
            discountType = 'percentage';
            break;
          case 'Bulk Purchase Incentive':
            discountValue = rule.discountPerUnit;
            discountType = 'per_unit';
            break;
          case 'Customer Loyalty Reward':
            discountValue = rule.discountAmount;
            discountType = 'flat';
            break;
          case 'Profit Margin Based':
            discountValue = Math.min(rule.maxDiscountFromMargin, 15 + Math.floor(Math.random() * 10));
            discountType = 'percentage';
            break;
          default:
            discountValue = 15;
            discountType = 'percentage';
        }

        // Generate unique coupon code
        const prefixes = {
          'Slow Moving Inventory': 'CLEAR',
          'Seasonal Clearance': 'SEASON',
          'Bulk Purchase Incentive': 'BULK',
          'Customer Loyalty Reward': 'LOYAL',
          'Profit Margin Based': 'SMART'
        };

        const code = `${prefixes[rule.name]}${Math.floor(1000 + Math.random() * 9000)}`;

        return {
          id: Date.now() + Math.random(),
          code,
          ruleName: rule.name,
          discount_type: discountType,
          value: discountValue,
          category: rule.category || 'all',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usage_limit: Math.floor(Math.random() * 500) + 100,
          status: 'active',
          generated_at: new Date().toISOString(),
          estimated_impact: {
            revenueIncrease: Math.floor(Math.random() * 10000) + 5000,
            unitsSold: Math.floor(Math.random() * 500) + 100,
            customerReach: Math.floor(Math.random() * 1000) + 200
          }
        };
      });

      setGeneratedDiscounts(prev => [...newDiscounts, ...prev].slice(0, 10));
      
      // Update metrics
      setMetrics({
        totalRevenueIncrease: newDiscounts.reduce((sum, d) => sum + d.estimated_impact.revenueIncrease, 0),
        inventoryReduction: newDiscounts.reduce((sum, d) => sum + d.estimated_impact.unitsSold, 0),
        customerAcquisition: newDiscounts.reduce((sum, d) => sum + d.estimated_impact.customerReach, 0),
        avgDiscountValue: newDiscounts.reduce((sum, d) => sum + d.value, 0) / newDiscounts.length
      });

      setIsGenerating(false);
    }, 1500);
  };

  const toggleRule = (id) => {
    setDiscountRules(rules => 
      rules.map(rule => 
        rule.id === id ? { ...rule, active: !rule.active } : rule
      )
    );
  };

  const activateDiscount = (id) => {
    setGeneratedDiscounts(discounts =>
      discounts.map(d => d.id === id ? { ...d, status: 'active' } : d)
    );
  };

  const deactivateDiscount = (id) => {
    setGeneratedDiscounts(discounts =>
      discounts.map(d => d.id === id ? { ...d, status: 'inactive' } : d)
    );
  };

  return (
    <div className="smart-discount-engine">
      <div className="engine-header">
        <div className="header-content">
          <h1 className="engine-title">
            <span className="title-icon">🤖</span>
            Smart Discount Engine
          </h1>
          <p className="engine-subtitle">
            AI-powered discount generation based on business intelligence
          </p>
        </div>
        
        <button 
          className="generate-btn"
          onClick={generateSmartDiscounts}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            <>
              <span className="btn-icon">⚡</span>
              Generate Smart Discounts
            </>
          )}
        </button>
      </div>

      {/* Business Intelligence Dashboard */}
      <div className="intelligence-dashboard">
        <h2 className="dashboard-title">Business Intelligence</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <span className="metric-value">${(metrics.totalRevenueIncrease / 1000).toFixed(1)}k</span>
              <span className="metric-label">Estimated Revenue Lift</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📦</div>
            <div className="metric-content">
              <span className="metric-value">{metrics.inventoryReduction}</span>
              <span className="metric-label">Units to Move</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <span className="metric-value">{metrics.customerAcquisition}</span>
              <span className="metric-label">Customer Reach</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <span className="metric-value">{metrics.avgDiscountValue.toFixed(1)}%</span>
              <span className="metric-label">Avg. Discount Value</span>
            </div>
          </div>
        </div>
      </div>

      <div className="engine-content">
        {/* Discount Rules Configuration */}
        <div className="rules-section">
          <div className="section-header">
            <h3 className="section-title">Discount Generation Rules</h3>
            <span className="active-count">
              {discountRules.filter(r => r.active).length} Active Rules
            </span>
          </div>
          
          <div className="rules-grid">
            {discountRules.map(rule => (
              <div key={rule.id} className={`rule-card ${rule.active ? 'active' : 'inactive'}`}>
                <div className="rule-header">
                  <div className="rule-toggle">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={rule.active}
                        onChange={() => toggleRule(rule.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="rule-info">
                    <h4 className="rule-name">{rule.name}</h4>
                    <p className="rule-description">{rule.description}</p>
                  </div>
                </div>
                
                <div className="rule-params">
                  {rule.minStockDays && (
                    <span className="param-tag">Stock Days: {rule.minStockDays}+</span>
                  )}
                  {rule.discountRange && (
                    <span className="param-tag">Discount: {rule.discountRange.min}-{rule.discountRange.max}%</span>
                  )}
                  {rule.minQuantity && (
                    <span className="param-tag">Min Qty: {rule.minQuantity}</span>
                  )}
                  {rule.season && (
                    <span className="param-tag">Season: {rule.season}</span>
                  )}
                  {rule.minMargin && (
                    <span className="param-tag">Min Margin: {rule.minMargin}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Discounts */}
        <div className="generated-discounts">
          <div className="section-header">
            <h3 className="section-title">AI-Generated Discounts</h3>
            <span className="discount-count">{generatedDiscounts.length} Generated</span>
          </div>

          {generatedDiscounts.length > 0 ? (
            <div className="discounts-table-container">
              <table className="smart-discounts-table">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Rule Applied</th>
                    <th>Discount</th>
                    <th>Valid Until</th>
                    <th>Estimated Impact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedDiscounts.map(discount => (
                    <tr key={discount.id}>
                      <td>
                        <div className="code-cell">
                          <span className="coupon-code">{discount.code}</span>
                          <span className="code-type">{discount.discount_type}</span>
                        </div>
                      </td>
                      <td>
                        <span className="rule-applied">{discount.ruleName}</span>
                      </td>
                      <td>
                        <span className="discount-value">
                          {discount.discount_type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                        </span>
                      </td>
                      <td>
                        <span className="valid-until">{discount.end_date}</span>
                      </td>
                      <td>
                        <div className="impact-cell">
                          <span className="impact-item">
                            <span className="impact-icon">💰</span>
                            ${discount.estimated_impact.revenueIncrease.toLocaleString()}
                          </span>
                          <span className="impact-item">
                            <span className="impact-icon">📦</span>
                            {discount.estimated_impact.unitsSold} units
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${discount.status}`}>
                          {discount.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {discount.status === 'active' ? (
                            <button 
                              className="action-btn deactivate"
                              onClick={() => deactivateDiscount(discount.id)}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button 
                              className="action-btn activate"
                              onClick={() => activateDiscount(discount.id)}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🤖</div>
              <h4>No Discounts Generated Yet</h4>
              <p>Click "Generate Smart Discounts" to create AI-powered discount suggestions</p>
            </div>
          )}
        </div>

        {/* Analytics Insights */}
        <div className="analytics-section">
          <h3 className="section-title">AI Insights & Recommendations</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-icon">📊</span>
                <span className="insight-title">Profit Optimization</span>
              </div>
              <p className="insight-text">
                Current discounts are optimized to maintain 35%+ profit margins while maximizing sales volume.
              </p>
            </div>
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-icon">🎯</span>
                <span className="insight-title">Customer Segmentation</span>
              </div>
              <p className="insight-text">
                Loyalty discounts are targeted at customers with 3+ purchases in the last 60 days.
              </p>
            </div>
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-icon">📦</span>
                <span className="insight-title">Inventory Analysis</span>
              </div>
              <p className="insight-text">
                42 products identified for clearance. Recommended discounts: 20-30%.
              </p>
            </div>
            <div className="insight-card">
              <div className="insight-header">
                <span className="insight-icon">💰</span>
                <span className="insight-title">Revenue Forecast</span>
              </div>
              <p className="insight-text">
                Projected revenue increase: 18.5% with current discount strategy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDiscountEngine;