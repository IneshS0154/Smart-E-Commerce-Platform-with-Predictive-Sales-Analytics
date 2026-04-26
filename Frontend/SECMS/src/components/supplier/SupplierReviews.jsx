import { useState, useEffect, useMemo } from 'react';
import { Star, ArrowRight, TrendingUp, Search, MessageSquare, Filter } from 'lucide-react';
import reviewAPI from '../../api/reviewAPI';
import './SupplierReviews.css';

export default function SupplierReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState(null);
    const [averageRating, setAverageRating] = useState(0);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedRating, setSelectedRating] = useState('All');

    useEffect(() => {
        const storedSeller = localStorage.getItem('seller');
        if (storedSeller) {
            const parsed = JSON.parse(storedSeller);
            setSeller(parsed);
            fetchSellerReviews(parsed.id);
        }
    }, []);

    const fetchSellerReviews = async (sellerId) => {
        setLoading(true);
        try {
            const [reviewsData, avgData] = await Promise.all([
                reviewAPI.getSellerReviews(sellerId),
                reviewAPI.getSellerAverageRating(sellerId)
            ]);
            setReviews(reviewsData || []);
            setAverageRating(avgData || 0);
        } catch (err) {
            console.error('Error fetching seller reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const cats = new Set(reviews.map(r => r.productCategory).filter(Boolean));
        return ['All', ...Array.from(cats)];
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesSearch = (r.reviewText?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()));
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

    if (loading) {
        return (
            <div className="sr-loading">
                <div className="sr-loader" />
                <p>Loading feedback...</p>
            </div>
        );
    }

    return (
        <div className="sr-container">
            <header className="sr-header">
                <div>
                    <h1 className="sr-title">Customer Reviews</h1>
                    <p className="sr-subtitle">Manage and monitor your product feedback</p>
                </div>
            </header>

            {/* ── Widgets ── */}
            <div className="sr-stats-grid">
                <div className="sr-stat-card">
                    <div className="sr-stat-icon sr-stat-icon--blue">
                        <Star size={20} />
                    </div>
                    <div className="sr-stat-info">
                        <div className="sr-stat-value">{stats.avg.toFixed(1)}</div>
                        <div className="sr-stat-label">Overall Rating</div>
                    </div>
                </div>

                <div className="sr-stat-card">
                    <div className="sr-stat-icon sr-stat-icon--purple">
                        <MessageSquare size={20} />
                    </div>
                    <div className="sr-stat-info">
                        <div className="sr-stat-value">{stats.total}</div>
                        <div className="sr-stat-label">Total Reviews</div>
                    </div>
                </div>

                <div className="sr-stat-card">
                    <div className="sr-stat-icon sr-stat-icon--green">
                        <TrendingUp size={20} />
                    </div>
                    <div className="sr-stat-info">
                        <div className="sr-stat-value">{stats.recentAvg.toFixed(1)}</div>
                        <div className="sr-stat-label">Avg (Recent)</div>
                    </div>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="sr-filter-bar">
                <div className="sr-search-wrapper">
                    <Search size={18} className="sr-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search reviews or customers..." 
                        className="sr-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="sr-filters">
                    <div className="sr-select-group">
                        <Filter size={14} className="sr-filter-label-icon" />
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="sr-select"
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
                        className="sr-select"
                    >
                        <option value="All">All Ratings</option>
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Stars</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Reviews Grid ── */}
            {filteredReviews.length === 0 ? (
                <div className="sr-empty">
                    <MessageSquare size={48} />
                    <h3>No results found</h3>
                    <p>Try adjusting your filters or search query to find what you're looking for.</p>
                </div>
            ) : (
                <div className="sr-grid">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="sr-card">
                            <div className="sr-card-header">
                                <div className="sr-user-info">
                                    <div className="sr-avatar">
                                        {review.customerName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="sr-user-meta">
                                        <h4 className="sr-username">{review.customerName}</h4>
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <button className="sr-card-arrow">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                            <div className="sr-card-body">
                                <p className="sr-review-text">
                                    {review.reviewText || "No comment provided."}
                                </p>
                            </div>
                            <div className="sr-card-footer">
                                <span className="sr-product-tag">{review.productName}</span>
                                <span className="sr-date">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

