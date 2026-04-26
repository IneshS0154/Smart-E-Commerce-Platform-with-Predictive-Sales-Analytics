import { useState, useEffect, useMemo } from 'react';
import {
    Star,
    ArrowRight,
    TrendingUp,
    Search,
    MessageSquare,
    Filter,
    Download,
    User,
    CheckCircle,
    AlertCircle,
    ShieldCheck,
    Trash2
} from 'lucide-react';
import reviewAPI from '../../api/reviewAPI';
import AdminSidebar from './AdminSidebar';
import './AdminReviews.css';
import DarkVeil from '../ui/DarkVeil';

export default function AdminReviews({ activeNav: activeNavProp, onNavChange, showSidebar = true }) {
    const [activeNav, setActiveNav] = useState(activeNavProp ?? "Reviews");
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedRating, setSelectedRating] = useState('All');

    const handleNavClick = (nav) => {
        setActiveNav(nav);
        if (onNavChange) onNavChange(nav);
    };

    const fetchAllReviews = async () => {
        setLoading(true);
        try {
            const data = await reviewAPI.getAllReviews();
            setReviews(data || []);

            if (data && data.length > 0) {
                const total = data.reduce((acc, r) => acc + r.rating, 0);
                setAverageRating(total / data.length);
            }
        } catch (err) {
            console.error('Error fetching admin reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

        try {
            await reviewAPI.deleteReviewAsAdmin(reviewId);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Failed to delete review');
        }
    };

    useEffect(() => {
        fetchAllReviews();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(reviews.map(r => r.productCategory).filter(Boolean));
        return ['All', ...Array.from(cats)];
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesSearch = (
                (r.reviewText?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (r.customerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (r.productName?.toLowerCase() || "").includes(searchQuery.toLowerCase())
            );
            const matchesCategory = selectedCategory === 'All' || r.productCategory === selectedCategory;
            const matchesRating = selectedRating === 'All' || r.rating === parseInt(selectedRating);

            return matchesSearch && matchesCategory && matchesRating;
        });
    }, [reviews, searchQuery, selectedCategory, selectedRating]);

    const stats = useMemo(() => {
        const total = reviews.length;
        const avg = averageRating;
        const recentAvg = reviews.slice(0, 10).reduce((acc, r) => acc + r.rating, 0) / (reviews.slice(0, 10).length || 1);

        return { total, avg, recentAvg };
    }, [reviews, averageRating]);

    const StarRating = ({ rating }) => (
        <div className="sr-stars">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={14}
                    fill={s <= rating ? "#fbbf24" : "none"}
                    stroke={s <= rating ? "#fbbf24" : "#d1d5db"}
                />
            ))}
        </div>
    );

    const handleLogout = () => {
        localStorage.removeItem("admin");
        window.location.href = "/";
    };

    const renderContent = () => (
        <div className="admin-vault-content">
            <header className="ar-header">
                <div>
                    <h1 className="ar-title">Platform Feedback</h1>
                    <p className="ar-subtitle">Monitor customer sentiment and product reviews across all suppliers.</p>
                </div>
                {/* <button className="export-report-btn">
                    <Download size={18} />
                    <span>Export Feedback</span>
                </button> */}
            </header>

            {/* Stats Widgets */}
            <div className="ar-stats-grid">
                <div className="ar-stat-card">
                    <div className="ar-stat-icon blue">
                        <Star size={20} />
                    </div>
                    <div className="ar-stat-info">
                        <h3 className="ar-stat-value">{stats.avg.toFixed(1)}</h3>
                        <p className="ar-stat-label">Global Average</p>
                    </div>
                </div>

                <div className="ar-stat-card">
                    <div className="ar-stat-icon purple">
                        <MessageSquare size={20} />
                    </div>
                    <div className="ar-stat-info">
                        <h3 className="ar-stat-value">{stats.total}</h3>
                        <p className="ar-stat-label">Total Reviews</p>
                    </div>
                </div>

                <div className="ar-stat-card">
                    <div className="ar-stat-icon green">
                        <TrendingUp size={20} />
                    </div>
                    <div className="ar-stat-info">
                        <h3 className="ar-stat-value">{stats.recentAvg.toFixed(1)}</h3>
                        <p className="ar-stat-label">Recent Trend</p>
                    </div>
                </div>

                <div className="ar-stat-card">
                    <div className="ar-stat-icon gray">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="ar-stat-info">
                        <h3 className="ar-stat-value">HEALTHY</h3>
                        <p className="ar-stat-label">Platform Health</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="ar-filter-bar">
                <div className="ar-search-wrapper">
                    <Search size={18} className="ar-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by review text, customer, or product..."
                        className="ar-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="ar-filters">
                    <div className="ar-select-group">
                        <Filter size={14} className="ar-filter-icon" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="ar-select"
                        >
                            <option value="All">All Categories</option>
                            {categories.filter(c => c !== 'All').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="ar-select"
                    >
                        <option value="All">All Ratings</option>
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Stars</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reviews Grid */}
            {loading ? (
                <div className="ar-loading">
                    <div className="ar-loader" />
                    <p>Loading platform reviews...</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="ar-empty">
                    <MessageSquare size={48} />
                    <h3>No reviews match your filters</h3>
                    <p>Try resetting your search or filter options.</p>
                </div>
            ) : (
                <div className="ar-grid">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="ar-card">
                            <div className="ar-card-header">
                                <div className="ar-user-info">
                                    <div className="ar-avatar">
                                        {review.customerName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="ar-user-meta">
                                        <h4 className="ar-username">{review.customerName}</h4>
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <div className="ar-card-actions">
                                    <button
                                        className="ar-delete-btn"
                                        onClick={() => handleDeleteReview(review.id)}
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="ar-review-badge">
                                        <CheckCircle size={14} />
                                        <span>Verified</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ar-card-body">
                                <h5 className="ar-product-name">{review.productName}</h5>
                                <p className="ar-review-text">
                                    {review.reviewText || "No comment provided."}
                                </p>
                            </div>
                            <div className="ar-card-footer">
                                <div className="ar-supplier-info">
                                    <span className="label">SUPPLIER</span>
                                    <span className="value">{review.seller?.storeName || 'Anywear'}</span>
                                </div>
                                <span className="ar-date">
                                    {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (!showSidebar) return renderContent();

    return (
        <div className="admin-reviews-dashboard">
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
            <main className="admin-reviews-main">
                {renderContent()}
            </main>
        </div>
    );
}
