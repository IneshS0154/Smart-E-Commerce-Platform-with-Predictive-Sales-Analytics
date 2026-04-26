import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../api/orderAPI';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
    Search, Cpu, Sparkles, TrendingUp,
    TrendingDown, Target, Info, Calendar,
    ArrowRight, CheckCircle2, AlertCircle,
    Activity
} from 'lucide-react';
import './SupplierAIInsights.css';

export default function SupplierAIInsights() {
    const [sellerId, setSellerId] = useState(null);
    const [lastMonthProfit, setLastMonthProfit] = useState('');
    const [targetProfit, setTargetProfit] = useState('');
    const [targetMonth, setTargetMonth] = useState('');

    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [stockPlan, setStockPlan] = useState(null);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState([]);

    const [isCalculatingRevenue, setIsCalculatingRevenue] = useState(false);

    useEffect(() => {
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            const parsedSeller = JSON.parse(storedSeller);
            setSellerId(parsedSeller.id);

            setIsCalculatingRevenue(true);
            orderAPI.getSellerOrders(parsedSeller.id)
                .then(orders => {
                    const rev = (orders || []).reduce((sum, o) => sum + (parseFloat(o?.subtotal) || 0), 0);
                    setLastMonthProfit(rev > 0 ? rev.toFixed(2) : '0');
                })
                .catch(err => {
                    console.error("Error fetching orders for revenue calculation:", err);
                    setLastMonthProfit('0');
                })
                .finally(() => {
                    setIsCalculatingRevenue(false);
                });
        }
    }, []);

    const generateChartData = (pred) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const data = [];

        let baseRev = parseFloat(lastMonthProfit) || 500000;

        for (let i = 0; i < 12; i++) {
            const isFuture = i > currentMonthIdx;
            const isTarget = i === (parseInt(targetMonth.split('-')[1], 10) - 1);

            let val = baseRev + (Math.random() * 200000 - 100000);

            if (isTarget && pred) {
                data.push({
                    name: months[i],
                    historical: null,
                    predicted: pred.prediction.point_estimate,
                    target: parseFloat(targetProfit)
                });
            } else if (isFuture) {
                data.push({
                    name: months[i],
                    historical: null,
                    predicted: val + (Math.random() * 5000),
                    target: null
                });
            } else {
                data.push({
                    name: months[i],
                    historical: val,
                    predicted: null,
                    target: null
                });
            }
            baseRev = val;
        }
        return data;
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setError(null);
        setPrediction(null);
        setStockPlan(null);
        setLoading(true);

        const payload = {
            seller_id: parseInt(sellerId, 10),
            last_month_profit: parseFloat(lastMonthProfit),
            target_profit: parseFloat(targetProfit),
            target_month: parseInt(targetMonth.split('-')[1], 10)
        };

        try {
            const predictRes = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!predictRes.ok) {
                const errData = await predictRes.json();
                throw new Error(errData.detail || 'Failed to fetch prediction');
            }

            const predictData = await predictRes.json();
            setPrediction(predictData);
            setChartData(generateChartData(predictData));

            const stockRes = await fetch('http://localhost:8000/stock-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (stockRes.ok) {
                const stockData = await stockRes.json();
                setStockPlan(stockData);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="li-dashboard">
            <header className="li-header">
                <h2>AI Analysis Overview</h2>
            </header>

            <div className="li-grid">
                {/* ── LEFT COLUMN ── */}
                <div className="li-col-left">
                    <div className="li-card">
                        <div className="li-card-header">
                            <h3>Target Parameters</h3>
                            <Target size={18} className="li-icon-btn" />
                        </div>
                        <form className="li-form" onSubmit={handlePredict}>
                            <div className="li-form-group">
                                <label>Past Month Profit (LKR)</label>
                                <input
                                    type="text"
                                    value={isCalculatingRevenue ? "Syncing orders..." : lastMonthProfit}
                                    disabled
                                    className="li-input-disabled"
                                />
                            </div>
                            <div className="li-form-group">
                                <label>Next Month Goal (LKR)</label>
                                <input
                                    type="number"
                                    value={targetProfit}
                                    onChange={e => setTargetProfit(e.target.value)}
                                    placeholder="Enter LKR amount"
                                    required
                                />
                            </div>
                            <div className="li-form-group">
                                <label>Target Month</label>
                                <input
                                    type="month"
                                    value={targetMonth}
                                    onChange={e => setTargetMonth(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="li-btn-primary" disabled={loading || !sellerId}>
                                {loading ? (
                                    <>
                                        <Cpu size={16} className="animate-spin" />
                                        Running AI Models...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Generate AI Insights
                                    </>
                                )}
                            </button>
                            {error && (
                                <div className="li-error" style={{ marginTop: '12px', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>

                    {prediction && (
                        <div className="li-card">
                            <div className="li-card-header">
                                <h3>AI Summary</h3>
                                <Info size={18} className="li-icon-btn" />
                            </div>

                            <div className="li-summary-row">
                                <span className="li-summary-label">Feasibility:</span>
                                <span className={`li-badge li-badge-${prediction.feasibility.toLowerCase()}`}>
                                    {prediction.feasibility.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="li-summary-row">
                                <span className="li-summary-label">Volume Required:</span>
                                <span className="li-summary-val">{prediction.prediction.orders_expected} orders</span>
                            </div>

                            <div className="li-recommendation-box">
                                <div className="li-rec-title">💡 AI Conclusion</div>
                                <p>{prediction.message}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="li-col-right">
                    <div className="li-kpi-row">
                        <div className="li-kpi-card">
                            <div className="li-kpi-header">
                                <div className="li-kpi-icon-wrapper li-icon--green">
                                    <TrendingUp size={18} />
                                </div>
                                <span className="li-kpi-label">Forecasted Profit</span>
                            </div>
                            <div className="li-kpi-val-row">
                                <span className="li-kpi-val">{prediction ? (prediction.prediction.point_estimate / 1000).toFixed(1) + 'k' : '--'}</span>
                                {prediction && (
                                    <span className={`li-kpi-growth ${prediction.prediction.point_estimate >= lastMonthProfit ? 'pos' : 'neg'}`}>
                                        {prediction.prediction.point_estimate >= lastMonthProfit ? '+' : ''}
                                        {(((prediction.prediction.point_estimate - lastMonthProfit) / (parseFloat(lastMonthProfit) || 1)) * 100).toFixed(0)}%
                                        <span className="li-growth-label"> vs prev</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="li-kpi-card">
                            <div className="li-kpi-header">
                                <div className="li-kpi-icon-wrapper li-icon--blue">
                                    <Activity size={18} />
                                </div>
                                <span className="li-kpi-label">Confidence Interval</span>
                            </div>
                            <div className="li-kpi-val-row">
                                <span className="li-kpi-val" style={{ fontSize: '20px' }}>{prediction ? `${(prediction.prediction.range_low / 1000).toFixed(0)}k - ${(prediction.prediction.range_high / 1000).toFixed(0)}k` : '--'}</span>
                                {prediction && (
                                    <span className="li-kpi-growth neutral">
                                        ±{(((prediction.prediction.range_high - prediction.prediction.range_low) / 2 / prediction.prediction.point_estimate) * 100).toFixed(0)}%
                                        <span className="li-growth-label"> variance</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="li-kpi-card">
                            <div className="li-kpi-header">
                                <div className="li-kpi-icon-wrapper li-icon--red">
                                    <AlertCircle size={18} />
                                </div>
                                <span className="li-kpi-label">Revenue Gap</span>
                            </div>
                            <div className="li-kpi-val-row">
                                <span className="li-kpi-val">{stockPlan ? (stockPlan.profit_gap / 1000).toFixed(1) + 'k' : '--'}</span>
                                {stockPlan && (
                                    <span className="li-kpi-growth neg">
                                        -{((stockPlan.profit_gap / (parseFloat(targetProfit) || 1)) * 100).toFixed(0)}%
                                        <span className="li-growth-label"> of target</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="li-kpi-card">
                            <div className="li-kpi-header">
                                <div className="li-kpi-icon-wrapper li-icon--purple">
                                    <CheckCircle2 size={18} />
                                </div>
                                <span className="li-kpi-label">Model Accuracy</span>
                            </div>
                            <div className="li-kpi-val-row">
                                <span className="li-kpi-val">{prediction ? prediction.confidence_pct + '%' : '--'}</span>
                                {prediction && (
                                    <span className="li-kpi-growth pos">
                                        {prediction.confidence_pct > 80 ? 'High' : 'Fair'}
                                        <span className="li-growth-label"> reliability</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="li-card li-chart-card">
                        <div className="li-card-header">
                            <h3>Predictive Trajectory</h3>
                            <div className="li-chart-actions">
                                <span className="li-pill">Linear View</span>
                                <span className="li-pill active">AI Forecast</span>
                            </div>
                        </div>
                        <div className="li-chart-container">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="99%" height="100%" aspect={2.5}>
                                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11, fontWeight: 700 }} dx={-10} tickFormatter={(val) => `${val / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: '1px solid #f1f1f1', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontFamily: 'Grift' }}
                                            formatter={(value) => [`LKR ${value.toLocaleString()}`, '']}
                                        />
                                        <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                                        <Line type="monotone" dataKey="historical" name="Historical" stroke="#111" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="predicted" name="AI Prediction" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#10b981' }} />
                                        <Line type="monotone" dataKey="target" name="User Target" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="li-chart-placeholder">
                                    <Sparkles size={32} />
                                    <p>Run a prediction to generate the trend chart.</p>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>

            {/* ── FULL WIDTH BOTTOM SECTION ── */}
            <div className="li-bottom-section">
                <div className="li-card li-table-card">
                    <div className="li-card-header">
                        <h3>Strategic Stock Adjustments</h3>
                    </div>

                    <div className="li-table-wrap">
                        <table className="li-table">
                            <thead>
                                <tr>
                                    <th>Product Category</th>
                                    <th>Recommendation</th>
                                    <th>Avg Profit/Order</th>
                                    <th>Current Share</th>
                                    <th>Strategic Reasoning</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockPlan && stockPlan.stock_recommendations ? (
                                    stockPlan.stock_recommendations.map((rec, i) => (
                                        <tr key={i}>
                                            <td className="li-td-main">{rec.category}</td>
                                            <td>
                                                <span className={`li-status li-status-${rec.action.toLowerCase()}`}>
                                                    {rec.action === 'INCREASE' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {rec.action}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>LKR {rec.avg_profit_per_order.toLocaleString()}</td>
                                            <td style={{ color: '#999', fontWeight: 600 }}>{rec.current_order_share}</td>
                                            <td className="li-td-desc">{rec.reason}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="li-td-empty">Await AI analysis for strategic insights...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
