import { useState, useEffect } from 'react';
import reviewAPI from '../../api/reviewAPI';
import './SupplierReviews.css';

export default function SupplierReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState(null);
    const [averageRating, setAverageRating] = useState(0);

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

    const StarDisplay = ({ rating, size = 16 }) => (
        <span style={{ color: '#fbbf24', fontSize: size }}>
            {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
        </span>
    );

    if (loading) {
        return (
            <div className="supplier-reviews">
                <div className="reviews-loading">
                    <p>Loading reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-reviews">
            <div className="reviews-header">
                <h2>Product Reviews</h2>
                <p>See what customers are saying about your products</p>
            </div>

            {/* Rating Summary */}
            <div className="reviews-summary">
                <div className="summary-card">
                    <div className="rating-big">
                        <span className="rating-number">{averageRating.toFixed(1)}</span>
                        <StarDisplay rating={averageRating} size={28} />
                    </div>
                    <p className="rating-text">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="no-reviews">
                    <p>No reviews yet. Once customers purchase and review your products, they will appear here.</p>
                </div>
            ) : (
                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-product">
                                    {review.productImage && (
                                        <img 
                                            src={review.productImage} 
                                            alt={review.productName}
                                            className="product-thumb" 
                                        />
                                    )}
                                    <div className="product-info">
                                        <h4>{review.productName}</h4>
                                        <p className="transaction-id">Transaction: {review.transactionId}</p>
                                    </div>
                                </div>
                                <div className="review-meta">
                                    <StarDisplay rating={review.rating} size={18} />
                                    <span className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString('en-GB')}
                                    </span>
                                </div>
                            </div>
                            <div className="review-content">
                                <p className="customer-name">By {review.customerName}</p>
                                {review.reviewText && (
                                    <p className="review-text">"{review.reviewText}"</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
